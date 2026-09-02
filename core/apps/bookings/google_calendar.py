import logging
import os
from zoneinfo import ZoneInfo

from django.conf import settings
from django.utils.timezone import is_naive, make_aware
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]


def get_calendar_service():
    """Authenticates the user and returns the Google Calendar API service."""
    creds = None
    token_path = getattr(settings, "GOOGLE_TOKEN_PATH", settings.BASE_DIR / "token.json")
    credentials_path = getattr(settings, "GOOGLE_CREDENTIALS_PATH", settings.BASE_DIR / "credentials.json")

    # Check if access token already exists
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    # If there are no valid credentials available, prompt the user to log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)

        # Save credentials for future runs
        with open(token_path, "w") as token_file:
            token_file.write(creds.to_json())

    return build("calendar", "v3", credentials=creds)


def create_google_meet_event(summary: str, description: str, start_time, end_time, client_email: str):
    """Creates a Google Calendar event with a Google Meet conference link.

    Returns a tuple: (google_event_id, google_meet_link)
    """
    service = get_calendar_service()

    # Timezone dynamique depuis settings
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
        "attendees": [
            {"email": client_email},
        ],
        "conferenceData": {
            "createRequest": {
                "requestId": f"meetus-{start_time.strftime('%Y%m%d%H%M%S')}",
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        },
    }

    event = service.events().insert(
        calendarId="primary",
        body=event_body,
        conferenceDataVersion=1,
    ).execute()

    google_event_id = event.get("id")
    google_meet_link = event.get("hangoutLink")

    return google_event_id, google_meet_link


def delete_google_calendar_event(google_event_id: str) -> bool:
    """Supprime un événement de Google Calendar via son ID."""
    if not google_event_id:
        return False

    try:
        service = get_calendar_service()
        service.events().delete(
            calendarId="primary",
            eventId=google_event_id,
            sendUpdates="none",
        ).execute()
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la suppression Google Calendar ({google_event_id}): {e}")
        return False