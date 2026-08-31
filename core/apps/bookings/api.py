from datetime import date, datetime, timedelta
from typing import List
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Form, Router
from ninja.errors import HttpError

from .models import Availability, BlockedDate, Booking, EventType
from .schemas import BookingOut, DaySlotsOut, EventTypeOut

router = Router(tags=["Bookings"])


@router.get(
    "/event-types",
    response=List[EventTypeOut],
    summary="List Active Event Types",
)
def list_event_types(request):
    """Retrieve all active event types available for booking."""
    return EventType.objects.filter(is_active=True)


@router.get(
    "/slots",
    response=DaySlotsOut,
    summary="Get Available Slots",
)
def get_available_slots(request, event_type_slug: str, target_date: date):
    """Calculate and return available booking slots for a given event type and date.

    - Excludes blocked dates.
    - Excludes slots overlapping with existing confirmed bookings.
    - Excludes past time slots if the target date is today or in the past.
    """
    event_type = get_object_or_404(
        EventType, slug=event_type_slug, is_active=True
    )

    # 1. Check if the target date falls within any blocked period
    is_blocked = BlockedDate.objects.filter(
        user=event_type.user,
        start_date__lte=target_date,
        end_date__gte=target_date,
    ).exists()

    if is_blocked:
        return {"date": target_date, "slots": []}

    # 2. Retrieve user availabilities for the specific day of the week (0=Monday, 6=Sunday)
    weekday = target_date.weekday()
    availabilities = Availability.objects.filter(
        user=event_type.user, day_of_week=weekday
    )

    if not availabilities.exists():
        return {"date": target_date, "slots": []}

    # 3. Retrieve existing confirmed bookings for the requested date
    existing_bookings = Booking.objects.filter(
        event_type__user=event_type.user,
        status=Booking.Status.CONFIRMED,
        start_time__date=target_date,
    )

    now = timezone.now()
    slots = []
    duration = timedelta(minutes=event_type.duration_minutes)

    # 4. Generate available slots based on user availability windows
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

            # Validate that slot is in the future
            is_past = slot_start < now

            # Validate that slot does not overlap with existing confirmed bookings
            overlap = existing_bookings.filter(
                start_time__lt=slot_end, end_time__gt=slot_start
            ).exists()

            if not is_past and not overlap:
                slots.append({"start_time": slot_start, "end_time": slot_end})

            current_dt += duration

    return {"date": target_date, "slots": slots}


@router.post(
    "/book",
    response={201: BookingOut},
    summary="Create Booking via Form Parameters",
)
def create_booking(
    request,
    event_type_slug: str = Form(...),
    client_name: str = Form(...),
    client_email: str = Form(...),
    start_time: datetime = Form(...),
    chosen_channel: str = Form(...),
    client_phone: str = Form(None),
):
    """Create a new booking using Form inputs in Swagger UI.

    - Validates that the requested time slot is in the future.
    - Ensures no double-booking occurs for the same provider/event type.
    """
    event_type = get_object_or_404(
        EventType, slug=event_type_slug, is_active=True
    )

    # Ensure start_time is timezone-aware
    if timezone.is_naive(start_time):
        start_time = timezone.make_aware(start_time)

    # 1. Reject bookings set in the past
    if start_time < timezone.now():
        raise HttpError(400, "Cannot book a time slot in the past.")

    end_time = start_time + timedelta(minutes=event_type.duration_minutes)

    # 2. Check for overlapping existing confirmed bookings
    conflict = Booking.objects.filter(
        event_type__user=event_type.user,
        status=Booking.Status.CONFIRMED,
        start_time__lt=end_time,
        end_time__gt=start_time,
    ).exists()

    if conflict:
        raise HttpError(400, "This time slot is no longer available.")

    # 3. Create the booking record
    booking = Booking.objects.create(
        event_type=event_type,
        client_name=client_name,
        client_email=client_email,
        client_phone=client_phone,
        chosen_channel=chosen_channel,
        start_time=start_time,
        end_time=end_time,
        status=Booking.Status.CONFIRMED,
    )

    return 201, booking