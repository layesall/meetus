from datetime import date
from typing import List
from uuid import UUID
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router
from ninja_jwt.authentication import JWTAuth

from .models import Booking, EventType
from .schemas import (
    BookingCancelIn,
    BookingCancelOut,
    BookingCreateIn,
    BookingOut,
    DaySlotsOut,
    EventTypeOut,
    MeetAccessOut,
)
from .services import (
    cancel_booking_service,
    create_booking_service,
    get_available_slots_service,
    get_meet_access_service,
)

public_router = Router(tags=["Bookings Public"])
admin_router = Router(tags=["Bookings Admin"], auth=JWTAuth())


# --- PUBLIC ENDPOINTS ---

@public_router.get("/event-types", response=List[EventTypeOut], summary="List Active Event Types")
def list_event_types(request):
    """Retrieve all active event types available for booking."""
    return EventType.objects.filter(is_active=True)


@public_router.get("/event-types/{slug}", response=EventTypeOut, summary="Get Event Type Details")
def get_event_type_by_slug(request, slug: str):
    """Retrieve details for a specific event type by its slug."""
    return get_object_or_404(EventType, slug=slug, is_active=True)


@public_router.get("/slots", response=DaySlotsOut, summary="Get Available Slots")
def get_available_slots(request, event_type_slug: str, target_date: date):
    """Calculate and return open time slots for a given date."""
    return get_available_slots_service(event_type_slug, target_date)


@public_router.post("/book", response={201: BookingOut}, summary="Create Booking")
def create_booking(request, payload: BookingCreateIn):
    """Create a new appointment booking with custom questions and duration validation."""
    booking = create_booking_service(payload)
    return 201, booking


@public_router.post("/cancel", response={200: BookingCancelOut}, summary="Cancel Booking via Token")
def cancel_booking_endpoint(request, payload: BookingCancelIn):
    """Cancel an existing booking using its cancel_token."""
    cancel_booking_service(payload.cancel_token)
    return 200, {
        "success": True,
        "message": "Booking successfully cancelled.",
        "cancelled_at": timezone.now(),
    }


@public_router.get("/{booking_id}/meet-access", response={200: MeetAccessOut, 400: MeetAccessOut, 403: MeetAccessOut, 410: MeetAccessOut}, summary="Check Meet Access")
def get_meet_access(request, booking_id: UUID):
    """Verify meeting access availability and obtain redirect URL."""
    status_code, response_payload = get_meet_access_service(booking_id)
    return status_code, response_payload


# --- PROTECTED ADMIN ENDPOINTS ---

@admin_router.get("/all", response=List[BookingOut], summary="List All Bookings")
def list_all_bookings(request):
    """Fetch all system bookings (Requires JWT Authentication)."""
    return Booking.objects.all().order_by("-start_time")