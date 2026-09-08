import logging
from datetime import date, datetime, timedelta
from typing import Dict, Tuple
from uuid import UUID

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja.errors import HttpError

from apps.notifications.services import NotificationService
from .models import AvailabilityRule, BlockedDate, Booking, EventType
from .schemas import BookingCreateIn

logger = logging.getLogger(__name__)


def is_date_blocked(target_date: date) -> bool:
    """Checks whether a given date is fully blocked."""
    return BlockedDate.objects.filter(
        start_date__lte=target_date,
        end_date__gte=target_date,
    ).exists()


def get_available_slots_service(event_type_slug: str, target_date: date) -> Dict:
    """Computes available time slots for a specific event type and date."""
    event_type = get_object_or_404(EventType, slug=event_type_slug, is_active=True)

    if is_date_blocked(target_date):
        return {"date": target_date, "slots": []}

    weekday = target_date.weekday()
    availabilities = AvailabilityRule.objects.filter(day_of_week=weekday).order_by("start_time")

    if not availabilities.exists():
        return {"date": target_date, "slots": []}

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

    for avail in availabilities:
        current_dt = timezone.make_aware(datetime.combine(target_date, avail.start_time))
        end_dt = timezone.make_aware(datetime.combine(target_date, avail.end_time))

        while current_dt + duration <= end_dt:
            slot_start = current_dt
            slot_end = current_dt + duration
            is_past = slot_start < now

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
    """Atomic booking creation handling dynamic durations, pricing, custom answers, and instant notifications."""
    notification_service = NotificationService()
    event_type = get_object_or_404(EventType, slug=payload.event_type_slug, is_active=True)

    start_time = payload.start_time
    if timezone.is_naive(start_time):
        start_time = timezone.make_aware(start_time)

    if start_time < timezone.now():
        raise HttpError(400, "Cannot book time slots in the past.")

    if payload.chosen_channel not in event_type.allowed_channels:
        raise HttpError(400, "Selected communication channel is not allowed.")

    # Duration handling (Standard vs Custom)
    if event_type.is_custom_duration_allowed and payload.duration_minutes:
        if payload.duration_minutes < event_type.duration_minutes:
            raise HttpError(400, f"Minimum allowed duration is {event_type.duration_minutes} minutes.")
        booking_duration_minutes = payload.duration_minutes
    else:
        booking_duration_minutes = event_type.duration_minutes

    target_date = start_time.date()
    if is_date_blocked(target_date):
        raise HttpError(400, "Selected date is unavailable.")

    # Schedule computations
    duration = timedelta(minutes=booking_duration_minutes)
    buffer_time = timedelta(minutes=event_type.buffer_time_minutes)
    end_time = start_time + duration

    weekday = target_date.weekday()
    booking_start_time = start_time.time()
    booking_end_time = end_time.time()

    valid_window_exists = AvailabilityRule.objects.filter(
        day_of_week=weekday,
        start_time__lte=booking_start_time,
        end_time__gte=booking_end_time,
    ).exists()

    if not valid_window_exists:
        raise HttpError(400, "Requested slot exceeds operational working hours.")

    # Pro-rata price calculation
    if event_type.is_custom_duration_allowed and payload.duration_minutes:
        ratio = booking_duration_minutes / event_type.duration_minutes
        calculated_price = float(event_type.price) * ratio
    else:
        calculated_price = float(event_type.price)

    blocked_until = end_time + buffer_time

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

        booking = Booking(
            event_type=event_type,
            client_name=payload.client_name,
            client_email=payload.client_email,
            client_phone=payload.client_phone,
            answers=payload.answers,
            chosen_channel=payload.chosen_channel,
            start_time=start_time,
            end_time=end_time,
            total_price=calculated_price,
            status=Booking.Status.CONFIRMED,
        )

        google_event_id = None
        google_meet_link = None

        if payload.chosen_channel == "google_meet":
            try:
                google_event_id, google_meet_link = notification_service.create_calendar_event(booking)
            except Exception as e:
                logger.error(f"Google Calendar creation failed: {e}")

        # Association et sauvegarde en base de données
        booking.google_event_id = google_event_id
        booking.google_meet_link = google_meet_link
        booking.save()

    # Envoi des e-mails post-sauvegarde (garantit la présence de google_meet_link)
    try:
        notification_service.send_booking_confirmation(booking)
    except Exception as e:
        logger.error(f"Confirmation email dispatch failed: {e}")

    return booking


def cancel_booking_service(cancel_token: UUID) -> Booking:
    """Cancels a booking using a cancellation token."""
    notification_service = NotificationService()
    booking = Booking.objects.filter(cancel_token=cancel_token).first()

    if not booking:
        raise HttpError(404, "Invalid cancellation token or booking not found.")

    if booking.status == Booking.Status.CANCELLED:
        raise HttpError(400, "This booking is already cancelled.")

    if not booking.is_cancellation_allowed:
        raise HttpError(400, "Cancellation window for this appointment has expired.")

    if booking.google_event_id:
        try:
            notification_service.delete_calendar_event(booking.google_event_id)
        except Exception as e:
            logger.error(f"Google Calendar deletion failed: {e}")

        booking.google_event_id = None
        booking.google_meet_link = None

    booking.status = Booking.Status.CANCELLED
    booking.save()

    try:
        notification_service.send_booking_cancellation(booking)
    except Exception as e:
        logger.error(f"Cancellation email dispatch failed: {e}")

    return booking


def get_meet_access_service(booking_id: UUID) -> Tuple[int, Dict]:
    """Verifies video conference room access state."""
    booking = get_object_or_404(Booking, id=booking_id)
    status_code, code, data = booking.get_meet_access_state()
    response_payload = {"code": code, **data}

    return status_code, response_payload