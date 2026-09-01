from datetime import timedelta
from django.utils import timezone
from django.shortcuts import render
from django.views import View
from .models import Booking
from .google_calendar import delete_google_calendar_event
from .email_service import send_booking_cancellation_emails


class CancelBookingView(View):
    template_name = "bookings/cancel_confirm.html"
    DEADLINE_HOURS = 24  # Annulation impossible à moins de 24h

    def _is_past_deadline(self, booking):
        now = timezone.now()
        deadline = booking.start_time - timedelta(hours=self.DEADLINE_HOURS)
        return now > deadline

    def get(self, request, token):
        booking = Booking.get_booking_from_token(token)
        if not booking:
            return render(request, "bookings/cancel_error.html", status=404)

        if booking.status == Booking.Status.CANCELLED:
            return render(request, self.template_name, {"booking": booking, "already_cancelled": True})

        if self._is_past_deadline(booking):
            return render(
                request, 
                self.template_name, 
                {"booking": booking, "too_late": True, "deadline_hours": self.DEADLINE_HOURS}
            )

        return render(request, self.template_name, {"booking": booking})

    def post(self, request, token):
        booking = Booking.get_booking_from_token(token)
        if not booking:
            return render(request, "bookings/cancel_error.html", status=404)

        if self._is_past_deadline(booking):
            return render(
                request, 
                self.template_name, 
                {"booking": booking, "too_late": True, "deadline_hours": self.DEADLINE_HOURS}
            )

        if booking.status != Booking.Status.CANCELLED:
            # 1. Suppression de l'événement dans Google Calendar
            if booking.google_event_id:
                delete_google_calendar_event(booking.google_event_id)
                booking.google_event_id = ""
                booking.google_meet_link = ""

            # 2. Mise à jour du statut en base de données
            booking.status = Booking.Status.CANCELLED
            booking.save()

            # 3. Envoi automatique des e-mails d'annulation (Client + Admin)
            send_booking_cancellation_emails(booking)

        return render(request, self.template_name, {"booking": booking, "success": True})