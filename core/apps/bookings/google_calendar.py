import os
from zoneinfo import ZoneInfo
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from django.utils.timezone import make_aware, is_naive

SCOPES = ['https://www.googleapis.com/auth/calendar.events']

def get_calendar_service():
    """Authenticates the user and returns the Google Calendar API service."""
    creds = None
    token_path = 'token.json'
    credentials_path = 'credentials.json'

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
        with open(token_path, 'w') as token_file:
            token_file.write(creds.to_json())

    return build('calendar', 'v3', credentials=creds)


def create_google_meet_event(summary: str, description: str, start_time, end_time, client_email: str):
    """Creates a Google Calendar event with a Google Meet conference link.

    Returns a tuple: (google_event_id, google_meet_link)
    """
    service = get_calendar_service()

    brussels_tz = ZoneInfo("Europe/Brussels")
    
    # Force la conversion explicite vers le fuseau horaire Europe/Brussels
    if is_naive(start_time):    
        start_time = make_aware(start_time, brussels_tz)
    else:
        start_time = start_time.astimezone(brussels_tz)

    if is_naive(end_time):
        end_time = make_aware(end_time, brussels_tz)
    else:
        end_time = end_time.astimezone(brussels_tz)

    event_body = {
        'summary': summary,
        'description': description,
        'start': {
            'dateTime': start_time.isoformat(),
            'timeZone': 'Europe/Brussels',
        },
        'end': {
            'dateTime': end_time.isoformat(),
            'timeZone': 'Europe/Brussels',
        },
        'attendees': [
            {'email': client_email},
        ],
        'conferenceData': {
            'createRequest': {
                'requestId': f"meetus-{start_time.strftime('%Y%m%d%H%M%S')}",
                'conferenceSolutionKey': {'type': 'hangoutsMeet'},
            }
        },
    }

    event = service.events().insert(
        calendarId='primary',
        body=event_body,
        conferenceDataVersion=1
    ).execute()

    google_event_id = event.get('id')
    google_meet_link = event.get('hangoutLink')

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
            sendUpdates="all",  # Notifie aussi les participants via Google
        ).execute()
        return True
    except Exception as e:
        print(f"Erreur lors de la suppression Google Calendar ({google_event_id}): {e}")
        return False