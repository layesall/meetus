import uuid
from datetime import timedelta
from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django_jsonform.models.fields import JSONField

User = get_user_model()


class EventType(models.Model):
    """
    Represents a service or meeting type offered to clients.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, default="")

    # JSONForm Schema: List of key features/inclusions
    included_features = JSONField(
        default=list,
        blank=True,
        schema={
            "type": "array",
            "items": {"type": "string"},
            "title": "Included features"
        },
        help_text="List of included points (e.g., 'Presentation', 'Feasibility Assessment')."
    )

    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text="Service price (0.00 for free services)."
    )
    currency = models.CharField(max_length=3, default="EUR")

    # Durations
    duration_minutes = models.PositiveIntegerField(
        help_text="Standard duration of the meeting in minutes."
    )
    is_custom_duration_allowed = models.BooleanField(
        default=False,
        help_text="If True, clients can select custom duration multiples."
    )
    buffer_time_minutes = models.PositiveIntegerField(
        default=0,
        help_text="Required break time after the meeting in minutes."
    )

    # JSONForm Schema: Allowed communication channels
    allowed_channels = JSONField(
        default=list,
        schema={
            "type": "array",
            "items": {
                "type": "string",
                "choices": [
                    {"title": "Google Meet", "value": "google_meet"},
                    {"title": "Phone", "value": "phone"},
                    {"title": "In Person", "value": "in_person"}
                ]
            },
            "title": "Allowed Communication Channels"
        },
        help_text="Select accepted communication channels."
    )

    # JSONForm Schema: Dynamic booking questions
    QUESTIONS_SCHEMA = {
        "type": "array",
        "title": "Client Form Questions",
        "items": {
            "type": "dict",
            "keys": {
                "id": {"type": "string", "title": "ID"},
                "label": {"type": "string", "title": "Label"},
                "type": {
                    "type": "string",
                    "title": "Field Type",
                    "choices": ["text", "textarea", "number", "select"],
                    "default": "text"
                },
                "required": {"type": "boolean", "title": "Required", "default": True},
                "options": {
                    "type": "array",
                    "title": "Options (only if type = select)",
                    "items": {"type": "string"}
                }
            }
        }
    }

    booking_questions = JSONField(
        default=list,
        blank=True,
        schema=QUESTIONS_SCHEMA,
        help_text="Configuration of custom form fields to collect during booking."
    )

    color = models.CharField(max_length=7, default="#38bdf8")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        type_str = f"{self.price} {self.currency}" if self.price > 0 else "Free"
        return f"{self.title} ({self.duration_minutes}m - {type_str})"


class AvailabilityRule(models.Model):
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
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ["day_of_week", "start_time"]
        verbose_name = "Availability Rule"
        verbose_name_plural = "Availability Rules"

    def __str__(self):
        day_name = dict(self.DAY_CHOICES).get(self.day_of_week, str(self.day_of_week))
        return f"{day_name}: {self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"


class BlockedDate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=255, blank=True, null=True, default="")

    def __str__(self):
        return f"Blocked: {self.start_date} to {self.end_date} ({self.reason or 'No reason provided'})"


class Booking(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.ForeignKey(EventType, on_delete=models.PROTECT, related_name="bookings")
    client_name = models.CharField(max_length=150)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=30, blank=True, null=True)

    # JSONForm Schema: Answers stored as Key/Value pairs
    answers = JSONField(
        default=dict,
        blank=True,
        schema={
            "type": "dict",
            "title": "Form Responses",
            "keys":{},
            "additionalProperties": True
        },
        help_text="Client responses to custom questions configured for this event type."
    )

    chosen_channel = models.CharField(max_length=50)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    google_event_id = models.CharField(max_length=255, blank=True, null=True)
    google_meet_link = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    cancel_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client_name} - {self.event_type.title}"

    @property
    def is_expired(self) -> bool:
        return timezone.now() > self.end_time

    @property
    def is_cancellation_allowed(self) -> bool:
        if self.status == self.Status.CANCELLED or self.is_expired:
            return False
        deadline_hours = getattr(settings, "MEETUS_CANCELLATION_DEADLINE_HOURS", 24)
        cancellation_limit = self.start_time - timedelta(hours=deadline_hours)
        return timezone.now() <= cancellation_limit

    def get_meet_access_state(self):
        now = timezone.now()
        if self.status == self.Status.CANCELLED:
            return 400, "BOOKING_CANCELLED", {"message": "This booking has been cancelled."}

        if self.is_expired or self.status == self.Status.COMPLETED:
            return 410, "BOOKING_EXPIRED", {
                "message": "This booking has ended.",
                "ended_at": self.end_time.isoformat()
            }

        access_minutes = getattr(settings, "MEETUS_MEET_ACCESS_BEFORE_MINUTES", 10)
        access_window_start = self.start_time - timedelta(minutes=access_minutes)

        if now < access_window_start:
            return 403, "MEET_NOT_AVAILABLE_YET", {
                "message": f"Available {access_minutes} minutes before the appointment time.",
                "available_at": access_window_start.isoformat()
            }

        return 200, "MEET_AVAILABLE", {
            "meet_url": self.google_meet_link,
            "expires_at": self.end_time.isoformat()
        }