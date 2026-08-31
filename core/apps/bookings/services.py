from datetime import datetime, timedelta
from django.utils import timezone
from ninja.errors import HttpError
from apps.bookings.models import EventType, Availability, Booking

def get_available_slots(event_type_slug: str, target_date):
    try:
        event_type = EventType.objects.get(slug=event_type_slug, is_active=True)
    except EventType.DoesNotExist:
        raise HttpError(404, "Type d'événement introuvable.")

    user = event_type.user
    weekday = target_date.weekday()

    availabilities = Availability.objects.filter(user=user, day_of_week=weekday)
    if not availabilities.exists():
        return {"date": target_date, "slots": []}

    existing_bookings = Booking.objects.filter(
        event_type__user=user,
        start_time__date=target_date,
        status__in=['pending', 'confirmed']
    )
    
    # Récupérer l'heure actuelle avec la timezone
    now = timezone.now()

    available_slots = []
    duration = timedelta(minutes=event_type.duration_minutes)

    for avail in availabilities:
        current_start = datetime.combine(target_date, avail.start_time)
        current_start = timezone.make_aware(current_start)
        
        day_end = datetime.combine(target_date, avail.end_time)
        day_end = timezone.make_aware(day_end)

        while current_start + duration <= day_end:
            slot_end = current_start + duration

            # 1. Vérifier si le créneau est dans le passé
            is_past = current_start < now

            # 2. Vérifier s'il y a un conflit de réservation
            is_overlapping = existing_bookings.filter(
                start_time__lt=slot_end,
                end_time__gt=current_start
            ).exists()

            if not is_past and not is_overlapping:
                available_slots.append({
                    "start_time": current_start,
                    "end_time": slot_end
                })

            current_start = slot_end

    return {"date": target_date, "slots": available_slots}


def create_booking_service(data):
    try:
        event_type = EventType.objects.get(slug=data.event_type_slug, is_active=True)
    except EventType.DoesNotExist:
        raise HttpError(404, "Type d'événement invalide.")

    # 1. Vérifier si l'heure demandée est dans le passé
    if data.start_time < timezone.now():
        raise HttpError(400, "Impossible de réserver un créneau dans le passé.")

    end_time = data.start_time + timedelta(minutes=event_type.duration_minutes)

    # 2. Vérifier si le créneau est déjà réservé
    conflict = Booking.objects.filter(
        event_type__user=event_type.user,
        status__in=['pending', 'confirmed'],
        start_time__lt=end_time,
        end_time__gt=data.start_time
    ).exists()

    if conflict:
        raise HttpError(400, "Ce créneau horaire n'est plus disponible.")

    # Création du RDV
    booking = Booking.objects.create(
        event_type=event_type,
        client_name=data.client_name,
        client_email=data.client_email,
        client_phone=data.client_phone,
        chosen_channel=data.chosen_channel,
        start_time=data.start_time,
        end_time=end_time,
        status='confirmed'
    )

    return booking