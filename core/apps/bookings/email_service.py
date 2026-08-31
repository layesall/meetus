from zoneinfo import ZoneInfo
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
from django.utils.timezone import is_naive, make_aware


def send_booking_confirmation_email(booking):
    """Sends a confirmation email to the client using the Brevo transactional email API."""
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.BREVO_API_KEY

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    # Conversion de la date UTC stockée en BDD vers la timezone locale (Europe/Brussels)
    brussels_tz = ZoneInfo("Europe/Brussels")
    start_dt = booking.start_time
    
    if is_naive(start_dt):
        start_dt = make_aware(start_dt, brussels_tz)
    else:
        start_dt = start_dt.astimezone(brussels_tz)

    formatted_start = start_dt.strftime("%d/%m/%Y à %H:%M")
    
    # Conditional content for Google Meet
    meet_info = ""
    if booking.google_meet_link:
        meet_info = f"""
        <p><strong>Lien de la visioconférence :</strong><br>
        <a href="{booking.google_meet_link}" style="color: #2563eb; text-decoration: underline;">
            Rejoindre la réunion Google Meet
        </a></p>
        """

    # Email HTML body
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #2563eb;">Réservation confirmée !</h2>
          <p>Bonjour <strong>{booking.client_name}</strong>,</p>
          <p>Votre rendez-vous a bien été confirmé. Voici les détails :</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Service :</td>
              <td style="padding: 8px 0;">{booking.event_type.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Date & Heure :</td>
              <td style="padding: 8px 0;">{formatted_start}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Canal choisi :</td>
              <td style="padding: 8px 0;">{booking.chosen_channel}</td>
            </tr>
          </table>

          {meet_info}

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            Si vous souhaitez annuler ou modifier ce rendez-vous, veuillez contacter directement l'organisateur.
          </p>
        </div>
      </body>
    </html>
    """

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": booking.client_email, "name": booking.client_name}],
        sender={"name": settings.BREVO_SENDER_NAME, "email": settings.BREVO_SENDER_EMAIL},
        subject=f"Confirmation : {booking.event_type.title} avec MeetUs",
        html_content=html_content,
    )

    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        return api_response
    except ApiException as e:
        print(f"Exception during Brevo email sending: {e}")
        return None