import logging
from datetime import timedelta
from django.shortcuts import render
from django.utils import timezone
from django.views import View

from .email_service import send_booking_cancellation_emails
from .google_calendar import delete_google_calendar_event
from .models import Booking

logger = logging.getLogger(__name__)


class CancelBookingView(View):
    template_name = "bookings/cancel_confirm.html"
    DEADLINE_HOURS = 24  # Cancellation cutoff limit (24 hours prior)

    def _is_past_deadline(self, booking: Booking) -> bool:
        now = timezone.now()
        deadline = booking.start_time - timedelta(hours=self.DEADLINE_HOURS)
        return now > deadline

    def get(self, request, token: str):
        booking = Booking.get_booking_from_token(token)
        if not booking:
            return render(request, "bookings/cancel_error.html", status=404)

        if booking.status == Booking.Status.CANCELLED:
            return render(
                request,
                self.template_name,
                {"booking": booking, "already_cancelled": True},
            )

        if self._is_past_deadline(booking):
            return render(
                request,
                self.template_name,
                {
                    "booking": booking,
                    "too_late": True,
                    "deadline_hours": self.DEADLINE_HOURS,
                },
            )

        return render(request, self.template_name, {"booking": booking})

    def post(self, request, token: str):
        booking = Booking.get_booking_from_token(token)
        if not booking:
            return render(request, "bookings/cancel_error.html", status=404)

        if self._is_past_deadline(booking):
            return render(
                request,
                self.template_name,
                {
                    "booking": booking,
                    "too_late": True,
                    "deadline_hours": self.DEADLINE_HOURS,
                },
            )

        if booking.status != Booking.Status.CANCELLED:
            if booking.google_event_id:
                try:
                    delete_google_calendar_event(booking.google_event_id)
                except Exception as e:
                    logger.error(f"Failed to delete Google Calendar event: {e}")

                booking.google_event_id = ""
                booking.google_meet_link = ""

            booking.status = Booking.Status.CANCELLED
            booking.save()

            try:
                send_booking_cancellation_emails(booking)
            except Exception as e:
                logger.error(f"Failed to send cancellation emails: {e}")

        return render(
            request, self.template_name, {"booking": booking, "success": True}
        )