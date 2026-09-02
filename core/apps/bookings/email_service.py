import logging
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def _get_mail_api_instance():
    """Initialise le client API Brevo Transactional Emails."""
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key["api-key"] = settings.BREVO_API_KEY
    return sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))


def send_custom_html_email(to_email: str, to_name: str, subject: str, template_path: str, context: dict) -> bool:
    """Rend un template HTML local Django et l'envoie via Brevo REST API."""
    try:
        html_content = render_to_string(template_path, context)
        api_instance = _get_mail_api_instance()

        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            sender={
                "name": getattr(settings, "BREVO_SENDER_NAME", "MeetUs"),
                "email": settings.BREVO_SENDER_EMAIL,
            },
            to=[{"email": to_email, "name": to_name}],
            subject=subject,
            html_content=html_content,
        )

        api_instance.send_transac_email(send_smtp_email)
        return True

    except ApiException as e:
        logger.error(f"[Brevo API Error] Échec d'envoi à {to_email} : {e}")
        return False
    except Exception as e:
        logger.error(f"[Email Dispatch Error] Échec de rendu ou d'envoi ({template_path}) : {e}")
        return False


def send_booking_confirmation_emails(booking) -> bool:
    """Envoie les confirmations (Client + Admin) avec templates HTML locaux."""
    formatted_date = booking.start_time.strftime("%d/%m/%Y à %H:%M")
    cancel_url = booking.get_cancel_url()

    context = {
        "client_name": booking.client_name,
        "client_email": booking.client_email,
        "event_title": booking.event_type.title,
        "start_time": formatted_date,
        "meet_link": booking.google_meet_link or "",
        "cancel_url": cancel_url,
    }

    # 1. Email au Client
    success_client = send_custom_html_email(
        to_email=booking.client_email,
        to_name=booking.client_name,
        subject=f"Confirmation : {booking.event_type.title}",
        template_path="bookings/emails/client_confirmation.html",
        context=context,
    )

    # 2. Email à l'Admin
    success_admin = send_custom_html_email(
        to_email=settings.ADMIN_NOTIFICATION_EMAIL,
        to_name="Admin Meetus",
        subject=f"Nouveau RDV : {booking.client_name}",
        template_path="bookings/emails/admin_confirmation.html",
        context=context,
    )

    return success_client and success_admin


def send_booking_cancellation_emails(booking) -> bool:
    """Envoie les annulations (Client + Admin) avec templates HTML locaux."""
    formatted_date = booking.start_time.strftime("%d/%m/%Y à %H:%M")

    context = {
        "client_name": booking.client_name,
        "client_email": booking.client_email,
        "event_title": booking.event_type.title,
        "start_time": formatted_date,
    }

    # 1. Confirmation d'annulation au Client
    success_client = send_custom_html_email(
        to_email=booking.client_email,
        to_name=booking.client_name,
        subject=f"Annulation confirmée : {booking.event_type.title}",
        template_path="bookings/emails/client_cancellation.html",
        context=context,
    )

    # 2. Notification d'annulation à l'Admin
    success_admin = send_custom_html_email(
        to_email=settings.ADMIN_NOTIFICATION_EMAIL,
        to_name="Admin Meetus",
        subject=f"RDV Annulé : {booking.client_name}",
        template_path="bookings/emails/admin_cancellation.html",
        context=context,
    )

    return success_client and success_admin