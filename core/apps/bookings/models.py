import uuid
from datetime import timedelta
from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class EventType(models.Model):
    """
    Represents a type of booking/service offered (e.g., 30-min consultation).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, default="")
    duration_minutes = models.PositiveIntegerField(
        help_text="Duration of the meeting in minutes."
    )
    buffer_time_minutes = models.PositiveIntegerField(
        default=0,
        help_text="Required break/buffer time after the meeting in minutes."
    )
    allowed_channels = models.JSONField(
        default=list,
        help_text="List of allowed channels, e.g., ['google_meet', 'phone']"
    )
    color = models.CharField(max_length=7, default="#3B82F6")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} ({self.duration_minutes}m + {self.buffer_time_minutes}m buffer)"


class AvailabilityRule(models.Model):
    """
    Defines weekly recurring working hours for a given day of the week.
    Multiple rules can exist for the same day to allow breaks (e.g., lunch breaks).
    """
    DAY_CHOICES = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField(help_text="Start time of the working window (e.g., 09:00).")
    end_time = models.TimeField(help_text="End time of the working window (e.g., 14:00).")

    class Meta:
        ordering = ["day_of_week", "start_time"]
        verbose_name = "Availability Rule"
        verbose_name_plural = "Availability Rules"

    def __str__(self):
        day_name = dict(self.DAY_CHOICES).get(self.day_of_week, str(self.day_of_week))
        return f"{day_name}: {self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"


class BlockedDate(models.Model):
    """
    Represents one-off blocked dates or date ranges (vacations, holidays).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=255, blank=True, null=True, default="")

    def __str__(self):
        return f"Blocked: {self.start_date} to {self.end_date} ({self.reason or 'No reason'})"


class Booking(models.Model):
    """
    Represents a booking made by a client for a specific event type.
    """
    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmé"
        CANCELLED = "cancelled", "Annulé"
        COMPLETED = "completed", "Terminé"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.ForeignKey(EventType, on_delete=models.PROTECT, related_name="bookings")
    client_name = models.CharField(max_length=150)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=30, blank=True, null=True)
    chosen_channel = models.CharField(max_length=50)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    google_event_id = models.CharField(max_length=255, blank=True, null=True)
    google_meet_link = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    cancel_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client_name} - {self.event_type.title}"

    @property
    def is_expired(self) -> bool:
        """Vérifie si la date de fin du rendez-vous est dépassée."""
        return timezone.now() > self.end_time

    @property
    def is_cancellation_allowed(self) -> bool:
        """
        Vérifie si le rendez-vous peut encore être annulé selon la deadline en heures.
        """
        if self.status == self.Status.CANCELLED or self.is_expired:
            return False

        deadline_hours = getattr(settings, "MEETUS_CANCELLATION_DEADLINE_HOURS", 24)
        cancellation_limit = self.start_time - timedelta(hours=deadline_hours)
        return timezone.now() <= cancellation_limit

    @property
    def is_meet_accessible(self) -> bool:
        """
        Le lien est accessible durant la fenêtre définie dans les settings.
        """
        now = timezone.now()
        access_minutes = getattr(settings, "MEETUS_MEET_ACCESS_BEFORE_MINUTES", 10)
        access_window_start = self.start_time - timedelta(minutes=access_minutes)
        return access_window_start <= now <= self.end_time

    def get_cancel_url(self) -> str:
        """
        Renvoie l'URL d'annulation orientée Frontend.
        """
        web_url = getattr(settings, "MEETUS_WEB_URL", "http://localhost:3000").rstrip("/")
        return f"{web_url}/bookings/cancel?token={self.cancel_token}"

    def get_meet_access_state(self):
        """
        Analyse et retourne l'état d'accès à la visioconférence sous forme de tuple:
        (HTTP_STATUS, ERROR_OR_SUCCESS_CODE, PAYLOAD_DATA)
        """
        now = timezone.now()

        # CAS 2 : Rendez-vous annulé
        if self.status == self.Status.CANCELLED:
            return 400, "BOOKING_CANCELLED", {
                "message": "Ce rendez-vous a été annulé. Le lien est désactivé."
            }

        # CAS 1 : Rendez-vous terminé (Heure actuelle > end_time ou statut COMPLETED)
        if self.is_expired or self.status == self.Status.COMPLETED:
            return 410, "BOOKING_EXPIRED", {
                "message": "Ce rendez-vous est terminé.",
                "ended_at": self.end_time.isoformat()
            }

        access_minutes = getattr(settings, "MEETUS_MEET_ACCESS_BEFORE_MINUTES", 10)
        access_window_start = self.start_time - timedelta(minutes=access_minutes)

        # CAS 3 : Trop tôt (Heure actuelle < start_time - 10 minutes)
        if now < access_window_start:
            return 403, "MEET_NOT_AVAILABLE_YET", {
                "message": f"Le lien de visioconférence sera disponible {access_minutes} minutes avant le rendez-vous.",
                "available_at": access_window_start.isoformat()
            }

        # CAS 4 : Rendez-vous en cours / Accessible
        return 200, "MEET_AVAILABLE", {
            "meet_url": self.google_meet_link,
            "expires_at": self.end_time.isoformat()
        }