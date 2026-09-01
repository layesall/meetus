import logging
from datetime import date, datetime, timedelta
from typing import List

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router
from ninja.errors import HttpError
from ninja_jwt.authentication import JWTAuth

from .email_service import send_booking_confirmation_emails
from .google_calendar import create_google_meet_event
from .models import Availability, BlockedDate, Booking, EventType
from .schemas import BookingCreateIn, BookingOut, DaySlotsOut, EventTypeOut

logger = logging.getLogger(__name__)

# Public Router (Client interactions)
public_router = Router(tags=["Bookings Public"])

# Protected Admin Router (Requires JWT Authentication)
admin_router = Router(tags=["Bookings Admin"], auth=JWTAuth())


# --- PUBLIC ENDPOINTS ---

@public_router.get(
    "/event-types",
    response=List[EventTypeOut],
    summary="List Active Event Types",
)
def list_event_types(request):
    """Retrieve all active event types available for booking."""
    return EventType.objects.filter(is_active=True)


@public_router.get(
    "/slots",
    response=DaySlotsOut,
    summary="Get Available Slots",
)
def get_available_slots(request, event_type_slug: str, target_date: date):
    """Calculate and return available booking slots for a given event type and date."""
    event_type = get_object_or_404(
        EventType, slug=event_type_slug, is_active=True
    )

    is_blocked = BlockedDate.objects.filter(
        user=event_type.user,
        start_date__lte=target_date,
        end_date__gte=target_date,
    ).exists()

    if is_blocked:
        return {"date": target_date, "slots": []}

    weekday = target_date.weekday()
    availabilities = Availability.objects.filter(
        user=event_type.user, day_of_week=weekday
    )

    if not availabilities.exists():
        return {"date": target_date, "slots": []}

    existing_bookings = Booking.objects.filter(
        event_type__user=event_type.user,
        status=Booking.Status.CONFIRMED,
        start_time__date=target_date,
    )

    now = timezone.now()
    slots = []
    duration = timedelta(minutes=event_type.duration_minutes)

    for avail in availabilities:
        current_dt = timezone.make_aware(
            datetime.combine(target_date, avail.start_time)
        )
        end_dt = timezone.make_aware(
            datetime.combine(target_date, avail.end_time)
        )

        while current_dt + duration <= end_dt:
            slot_start = current_dt
            slot_end = current_dt + duration

            is_past = slot_start < now
            overlap = existing_bookings.filter(
                start_time__lt=slot_end, end_time__gt=slot_start
            ).exists()

            if not is_past and not overlap:
                slots.append({"start_time": slot_start, "end_time": slot_end})

            current_dt += duration

    return {"date": target_date, "slots": slots}


@public_router.post(
    "/book",
    response={201: BookingOut},
    summary="Create Booking via JSON Payload",
)
def create_booking(request, payload: BookingCreateIn):
    """Create a new booking using validated JSON input with concurrency protection."""
    event_type = get_object_or_404(
        EventType, slug=payload.event_type_slug, is_active=True
    )

    start_time = payload.start_time
    if timezone.is_naive(start_time):
        start_time = timezone.make_aware(start_time)

    if start_time < timezone.now():
        raise HttpError(400, "Cannot book a time slot in the past.")

    if payload.chosen_channel not in event_type.allowed_channels:
        raise HttpError(400, "The selected communication channel is invalid.")

    end_time = start_time + timedelta(minutes=event_type.duration_minutes)

    # Atomic transaction block with row locks to prevent race conditions
    with transaction.atomic():
        conflict = (
            Booking.objects.select_for_update()
            .filter(
                event_type__user=event_type.user,
                status=Booking.Status.CONFIRMED,
                start_time__lt=end_time,
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
                        f"Rendez-vous réservé via MeetUs.\n"
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

    try:
        send_booking_confirmation_emails(booking)
    except Exception as e:
        logger.error(f"Brevo email dispatch failed: {e}")

    return 201, booking


# --- PROTECTED ADMIN ENDPOINTS ---

@admin_router.get("/all", response=List[BookingOut], summary="List All Bookings")
def list_all_bookings(request):
    """Retrieve all system bookings (Requires JWT authorization)."""
    return Booking.objects.all().order_by("-start_time")