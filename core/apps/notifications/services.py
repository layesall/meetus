# apps/notifications/services.py

import logging
from typing import Optional, Tuple
from django.conf import settings

from apps.notifications.adapters.brevo import BrevoEmailAdapter
from apps.notifications.adapters.calendar import GoogleCalendarAdapter
from apps.notifications.adapters.smtp import SmtpEmailAdapter

logger = logging.getLogger(__name__)


class NotificationService:
    """Service central unifié pour la gestion du calendrier et l'envoi de notifications (Façade agnostique)."""

    def __init__(self):
        # 1. Sélection de l'adaptateur Email selon la configuration
        provider = getattr(settings, "MEETUS_EMAIL_PROVIDER", "smtp").lower()
        if provider == "brevo":
            self.email_adapter = BrevoEmailAdapter()
        else:
            self.email_adapter = SmtpEmailAdapter()

        # 2. Initialisation de l'adaptateur Calendrier
        self.calendar_adapter = GoogleCalendarAdapter()

    # ------------------------------------------------------------------
    # MÉTHODES CALENDRIER
    # ------------------------------------------------------------------

    def create_calendar_event(self, booking) -> Tuple[Optional[str], Optional[str]]:
        """
        Crée un événement Google Calendar avec lien de visioconférence Google Meet.
        
        Returns:
            Tuple[Optional[str], Optional[str]]: (google_event_id, google_meet_link)
        """
        summary = (
            f"Rendez-vous : {booking.event_type.title}"
            if hasattr(booking, "event_type") and booking.event_type
            else "Rendez-vous Meetus"
        )
        description = f"Réservation Meetus pour {booking.client_name} ({booking.client_email})"

        return self.calendar_adapter.create_event(
            summary=summary,
            description=description,
            start_time=booking.start_time,
            end_time=booking.end_time,
            client_email=booking.client_email,
        )

    def delete_calendar_event(self, google_event_id: str) -> bool:
        """Supprime un événement Google Calendar via son identifiant."""
        return self.calendar_adapter.delete_event(google_event_id)

    # ------------------------------------------------------------------
    # MÉTHODES EMAILS
    # ------------------------------------------------------------------

    def _build_booking_context(self, booking) -> dict:
        """Construit le dictionnaire de contexte complet attendu par les templates HTML."""
        formatted_date = (
            booking.start_time.strftime("%d/%m/%Y à %H:%M")
            if hasattr(booking, "start_time") and booking.start_time
            else ""
        )

        return {
            "booking": booking,
            "client_name": booking.client_name,
            "client_email": booking.client_email,
            "event_title": (
                booking.event_type.title
                if hasattr(booking, "event_type") and booking.event_type
                else ""
            ),
            "start_time": formatted_date,
            "meet_link": getattr(booking, "google_meet_link", "") or "",
            "cancel_url": (
                booking.get_cancel_url() if hasattr(booking, "get_cancel_url") else ""
            ),
        }

    def send_booking_confirmation(self, booking) -> bool:
        """Envoie les e-mails de confirmation (Client + Admin)."""
        context = self._build_booking_context(booking)
        event_title = context["event_title"]

        # 1. E-mail au Client
        success_client = self.email_adapter.send_email(
            to_email=booking.client_email,
            to_name=booking.client_name,
            subject=f"Confirmation : {event_title}",
            template_name="notifications/client_confirmation.html",
            context=context,
        )

        # 2. E-mail à l'Admin
        admin_email = getattr(settings, "MEETUS_ADMIN_EMAIL", None)
        success_admin = True
        if admin_email:
            success_admin = self.email_adapter.send_email(
                to_email=admin_email,
                to_name="Admin Meetus",
                subject=f"Nouveau RDV : {booking.client_name}",
                template_name="notifications/admin_confirmation.html",
                context=context,
            )

        return success_client and success_admin

    def send_booking_cancellation(self, booking) -> bool:
        """Envoie les e-mails d'annulation (Client + Admin)."""
        context = self._build_booking_context(booking)
        event_title = context["event_title"]

        # 1. E-mail au Client
        success_client = self.email_adapter.send_email(
            to_email=booking.client_email,
            to_name=booking.client_name,
            subject=f"Annulation confirmée : {event_title}",
            template_name="notifications/client_cancellation.html",
            context=context,
        )

        # 2. E-mail à l'Admin
        admin_email = getattr(settings, "MEETUS_ADMIN_EMAIL", None)
        success_admin = True
        if admin_email:
            success_admin = self.email_adapter.send_email(
                to_email=admin_email,
                to_name="Admin Meetus",
                subject=f"RDV Annulé : {booking.client_name}",
                template_name="notifications/admin_cancellation.html",
                context=context,
            )

        return success_client and success_admin