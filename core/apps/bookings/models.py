import uuid
from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model
from django.core.signing import Signer, BadSignature
from django.urls import reverse

User = get_user_model()
signer = Signer()

class EventType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="event_types")
    title = models.CharField(max_length=150)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    duration_minutes = models.PositiveIntegerField(default=30)
    allowed_channels = models.JSONField(default=list)  # ex: ["google_meet", "phone"]
    color = models.CharField(max_length=7, default="#3B82F6")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.duration_minutes} min)"


class Availability(models.Model):
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, "Lundi"
        TUESDAY = 1, "Mardi"
        WEDNESDAY = 2, "Mercredi"
        THURSDAY = 3, "Jeudi"
        FRIDAY = 4, "Vendredi"
        SATURDAY = 5, "Samedi"
        SUNDAY = 6, "Dimanche"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="availabilities")
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        verbose_name_plural = "Availabilities"
        ordering = ["day_of_week", "start_time"]


class Booking(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmé"
        CANCELLED = "cancelled", "Annulé"

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

    def get_cancel_token(self):
        """Generate a new cancel token for the booking."""
        return signer.sign(str(self.pk))

    def get_cancel_url(self, request=None):
        """Returns the URL for cancelling the booking using the cancel token."""
        token = self.get_cancel_token()
        relative_url = reverse("booking_cancel", kwargs={"token": token})
        if request:
            return request.build_absolute_uri(relative_url)
        base_url = getattr(settings, "MEETUS_URL", "http://127.0.0.1:8000").rstrip("/")
        return f"{base_url}{relative_url}"

    @staticmethod
    def get_booking_from_token(token):
        """Retrieve a booking instance from a cancel token."""
        try:
            booking_id = signer.unsign(token)
            return Booking.objects.get(pk=booking_id)
        except (BadSignature, Booking.DoesNotExist):
            return None


class BlockedDate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocked_dates")
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Bloqué du {self.start_date} au {self.end_date}"