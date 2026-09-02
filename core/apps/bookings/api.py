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

# Routers
public_router = Router(tags=["Bookings Public"])
admin_router = Router(tags=["Bookings Admin"], auth=JWTAuth())


# --- PUBLIC ENDPOINTS ---

@public_router.get("/event-types", response=List[EventTypeOut], summary="List Active Event Types")
def list_event_types(request):
    """Retrieve all active event types available for booking."""
    return EventType.objects.filter(is_active=True)

@public_router.get("/event-types/{slug}", response=EventTypeOut, summary="Get Event Type Details")
def get_event_type_by_slug(request, slug: str):
    """Retrieve details of a specific event type by its slug."""
    return get_object_or_404(EventType, slug=slug, is_active=True)


@public_router.get("/slots", response=DaySlotsOut, summary="Get Available Slots")
def get_available_slots(request, event_type_slug: str, target_date: date):
    """Calculate and return available booking time slots."""
    return get_available_slots_service(event_type_slug, target_date)


@public_router.post("/book", response={201: BookingOut}, summary="Create Booking via JSON Payload")
def create_booking(request, payload: BookingCreateIn):
    """Create a new booking with full validation."""
    booking = create_booking_service(payload)
    return 201, booking


@public_router.post("/cancel", response={200: BookingCancelOut}, summary="Cancel Booking via Token")
def cancel_booking_endpoint(request, payload: BookingCancelIn):
    """Cancel a booking using its unique cancel_token."""
    cancel_booking_service(payload.cancel_token)
    return 200, {
        "success": True,
        "message": "Booking cancelled successfully.",
        "cancelled_at": timezone.now(),
    }


@public_router.get("/{booking_id}/meet-access", response={200: MeetAccessOut, 400: MeetAccessOut, 403: MeetAccessOut, 410: MeetAccessOut},summary="Check and Retrieve Meet Access")
def get_meet_access(request, booking_id: UUID):
    """Headless access check for Google Meet link."""
    status_code, response_payload = get_meet_access_service(booking_id)
    return status_code, response_payload


# --- PROTECTED ADMIN ENDPOINTS ---

@admin_router.get("/all", response=List[BookingOut], summary="List All Bookings")
def list_all_bookings(request):
    """Retrieve all system bookings (Requires JWT authorization)."""
    return Booking.objects.all().order_by("-start_time")