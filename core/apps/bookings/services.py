import logging
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Tuple
from uuid import UUID

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja.errors import HttpError

from .email_service import (
    send_booking_cancellation_emails,
    send_booking_confirmation_emails,
)
from .google_calendar import (
    create_google_meet_event,
    delete_google_calendar_event,
)
from .models import AvailabilityRule, BlockedDate, Booking, EventType
from .schemas import BookingCreateIn

logger = logging.getLogger(__name__)


def is_date_blocked(target_date: date) -> bool:
    """Vérifie si une date est entièrement bloquée (ex: vacances)."""
    return BlockedDate.objects.filter(
        start_date__lte=target_date,
        end_date__gte=target_date,
    ).exists()


def get_available_slots_service(event_type_slug: str, target_date: date) -> Dict:
    """
    Calcule et génère les créneaux disponibles pour un type d'événement et une date donnés.
    """
    event_type = get_object_or_404(EventType, slug=event_type_slug, is_active=True)

    # 1. Date bloquée
    if is_date_blocked(target_date):
        return {"date": target_date, "slots": []}

    # 2. Règles de travail
    weekday = target_date.weekday()
    availabilities = AvailabilityRule.objects.filter(day_of_week=weekday).order_by("start_time")

    if not availabilities.exists():
        return {"date": target_date, "slots": []}

    # 3. Réservations existantes du jour
    day_start = timezone.make_aware(datetime.combine(target_date, datetime.min.time()))
    day_end = timezone.make_aware(datetime.combine(target_date, datetime.max.time()))

    existing_bookings = Booking.objects.filter(
        status=Booking.Status.CONFIRMED,
        start_time__lt=day_end,
        end_time__gt=day_start,
    )

    now = timezone.now()
    slots = []
    duration = timedelta(minutes=event_type.duration_minutes)
    buffer_time = timedelta(minutes=event_type.buffer_time_minutes)
    total_step = duration + buffer_time

    # 4. Génération des créneaux
    for avail in availabilities:
        current_dt = timezone.make_aware(datetime.combine(target_date, avail.start_time))
        end_dt = timezone.make_aware(datetime.combine(target_date, avail.end_time))

        while current_dt + duration <= end_dt:
            slot_start = current_dt
            slot_end = current_dt + duration

            is_past = slot_start < now

            # Vérification du chevauchement (durée + buffer)
            overlap = False
            for booking in existing_bookings:
                if slot_start < booking.end_time and (slot_start + total_step) > booking.start_time:
                    overlap = True
                    break

            if not is_past and not overlap:
                slots.append({"start_time": slot_start, "end_time": slot_end})

            current_dt += total_step

    return {"date": target_date, "slots": slots}


def create_booking_service(payload: BookingCreateIn) -> Booking:
    """
    Service de création atomique d'un rendez-vous avec toutes les validations métier,
    intégration Google Calendar et envoi d'e-mails.
    """
    event_type = get_object_or_404(EventType, slug=payload.event_type_slug, is_active=True)

    start_time = payload.start_time
    if timezone.is_naive(start_time):
        start_time = timezone.make_aware(start_time)

    now = timezone.now()
    if start_time < now:
        raise HttpError(400, "Cannot book a time slot in the past.")

    if payload.chosen_channel not in event_type.allowed_channels:
        raise HttpError(400, "The selected communication channel is invalid.")

    target_date = start_time.date()

    if is_date_blocked(target_date):
        raise HttpError(400, "The selected date is not available for booking.")

    # Validation de la plage horaire de travail
    weekday = target_date.weekday()
    booking_start_time = start_time.time()

    duration = timedelta(minutes=event_type.duration_minutes)
    buffer_time = timedelta(minutes=event_type.buffer_time_minutes)
    end_time = start_time + duration
    booking_end_time = end_time.time()

    valid_window_exists = AvailabilityRule.objects.filter(
        day_of_week=weekday,
        start_time__lte=booking_start_time,
        end_time__gte=booking_end_time,
    ).exists()

    if not valid_window_exists:
        raise HttpError(400, "The requested time slot falls outside of allowed working hours.")

    blocked_until = end_time + buffer_time

    # Transaction Atomique avec verrouillage de lignes
    with transaction.atomic():
        conflict = (
            Booking.objects.select_for_update()
            .filter(
                status=Booking.Status.CONFIRMED,
                start_time__lt=blocked_until,
                end_time__gt=start_time,
            )
            .exists()
        )

        if conflict:
            raise HttpError(409, "This time slot is no longer available.")

        google_event_id = None
        google_meet_link = None

        if payload.chosen_channel == "google_meet":
            try:
                google_event_id, google_meet_link = create_google_meet_event(
                    summary=f"{event_type.title} - {payload.client_name}",
                    description=(
                        f"Rendez-vous réservé via Meetus.\n"
                        f"Client: {payload.client_name}\n"
                        f"Email: {payload.client_email}"
                    ),
                    start_time=start_time,
                    end_time=end_time,
                    client_email=payload.client_email,
                )
            except Exception as e:
                logger.error(f"Google Calendar event creation failed: {e}")

        booking = Booking.objects.create(
            event_type=event_type,
            client_name=payload.client_name,
            client_email=payload.client_email,
            client_phone=payload.client_phone,
            chosen_channel=payload.chosen_channel,
            start_time=start_time,
            end_time=end_time,
            google_event_id=google_event_id,
            google_meet_link=google_meet_link,
            status=Booking.Status.CONFIRMED,
        )

    # Notifications e-mail post-création
    try:
        send_booking_confirmation_emails(booking)
    except Exception as e:
        logger.error(f"Brevo email dispatch failed: {e}")

    return booking


def cancel_booking_service(cancel_token: str) -> Booking:
    """
    Service d'annulation d'un rendez-vous via son token unique.
    """
    booking = Booking.objects.filter(cancel_token=cancel_token).first()

    if not booking:
        raise HttpError(404, "Invalid cancellation token or booking not found.")

    if booking.status == Booking.Status.CANCELLED:
        raise HttpError(400, "This booking has already been cancelled.")

    if not booking.is_cancellation_allowed:
        raise HttpError(400, "The cancellation window for this booking has expired.")

    # Nettoyage Google Calendar si présent
    if booking.google_event_id:
        try:
            delete_google_calendar_event(booking.google_event_id)
        except Exception as e:
            logger.error(f"Failed to delete Google Calendar event: {e}")

        booking.google_event_id = None
        booking.google_meet_link = None

    booking.status = Booking.Status.CANCELLED
    booking.save()

    # Emails d'annulation
    try:
        send_booking_cancellation_emails(booking)
    except Exception as e:
        logger.error(f"Failed to send cancellation emails: {e}")

    return booking


def get_meet_access_service(booking_id: UUID) -> Tuple[int, Dict]:
    """
    Service de vérification d'accès au lien Google Meet.
    Retourne le tuple (HTTP_STATUS_CODE, RESPONSE_PAYLOAD).
    """
    booking = get_object_or_404(Booking, id=booking_id)
    status_code, code, data = booking.get_meet_access_state()
    response_payload = {"code": code, **data}

    return status_code, response_payload