import logging
import os
import uuid
from typing import Optional, Tuple
from zoneinfo import ZoneInfo

from django.conf import settings
from django.utils.timezone import is_naive, make_aware
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from apps.notifications.adapters.base import BaseCalendarAdapter

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]


class GoogleCalendarAdapter(BaseCalendarAdapter):
    """Adaptateur pour la gestion des événements Google Calendar et liens Meet (Admin uniquement)."""

    def _get_service(self):
        """Authentifie l'utilisateur admin et retourne l'instance du service Google Calendar API."""
        creds = None
        token_path = getattr(settings, "GOOGLE_TOKEN_PATH", settings.BASE_DIR / "token.json")
        credentials_path = getattr(
            settings, "GOOGLE_CREDENTIALS_PATH", settings.BASE_DIR / "credentials.json"
        )

        if os.path.exists(token_path):
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)

            with open(token_path, "w") as token_file:
                token_file.write(creds.to_json())

        return build("calendar", "v3", credentials=creds)

    def create_event(
        self,
        summary: str,
        description: str,
        start_time,
        end_time,
        client_email: str,
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Crée un événement Google Calendar sur le calendrier principal de l'admin uniquement.
        Génère un lien Google Meet sans ajouter le client en participant (pas d'invitation agenda).
        """
        try:
            service = self._get_service()
            app_tz_name = getattr(settings, "TIME_ZONE", "UTC")
            app_tz = ZoneInfo(app_tz_name)

            if is_naive(start_time):
                start_time = make_aware(start_time, app_tz)
            else:
                start_time = start_time.astimezone(app_tz)

            if is_naive(end_time):
                end_time = make_aware(end_time, app_tz)
            else:
                end_time = end_time.astimezone(app_tz)

            # requestId unique via UUID pour éviter les conflits et erreurs Google API
            unique_request_id = f"meetus-{uuid.uuid4().hex}"

            event_body = {
                "summary": summary,
                "description": description,
                "start": {
                    "dateTime": start_time.isoformat(),
                    "timeZone": app_tz_name,
                },
                "end": {
                    "dateTime": end_time.isoformat(),
                    "timeZone": app_tz_name,
                },
                # Pas de liste 'attendees' : le client ne reçoit pas d'invitation dans son agenda
                "conferenceData": {
                    "createRequest": {
                        "requestId": unique_request_id,
                        "conferenceSolutionKey": {"type": "hangoutsMeet"},
                    }
                },
            }

            event = (
                service.events()
                .insert(
                    calendarId="primary",
                    body=event_body,
                    conferenceDataVersion=1,
                    sendUpdates="none",  # N'envoie aucune notification par Google
                )
                .execute()
            )

            google_event_id = event.get("id")

            # Extraction robuste du lien Google Meet
            google_meet_link = event.get("hangoutLink")
            if not google_meet_link and "conferenceData" in event:
                for entry_point in event["conferenceData"].get("entryPoints", []):
                    if entry_point.get("entryPointType") == "video":
                        google_meet_link = entry_point.get("uri")
                        break

            return google_event_id, google_meet_link

        except Exception as e:
            logger.error(f"Error creating Google Calendar event: {e}", exc_info=True)
            return None, None

    def delete_event(self, event_id: str) -> bool:
        """Supprime un événement du calendrier principal de l'admin."""
        if not event_id:
            return False

        try:
            service = self._get_service()
            service.events().delete(
                calendarId="primary",
                eventId=event_id,
                sendUpdates="none",
            ).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting Google Calendar event ({event_id}): {e}", exc_info=True)
            return False