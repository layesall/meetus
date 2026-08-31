from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import Availability, BlockedDate, Booking, EventType


@admin.register(EventType)
class EventTypeAdmin(ModelAdmin):
    list_display = ["title", "slug", "duration_minutes", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["title", "slug"]


@admin.register(Availability)
class AvailabilityAdmin(ModelAdmin):
    list_display = ["user", "day_of_week", "start_time", "end_time"]
    list_filter = ["day_of_week", "user"]


@admin.register(Booking)
class BookingAdmin(ModelAdmin):
    list_display = [
        "client_name",
        "client_email",
        "event_type",
        "start_time",
        "chosen_channel",
        "display_status_badge",
    ]
    list_filter = ["status", "chosen_channel", "event_type", "start_time"]
    search_fields = ["client_name", "client_email", "google_event_id"]
    ordering = ["-start_time"]
    readonly_fields = ["google_event_id", "google_meet_link"]

    @display(
        description="Statut",
        label={
            Booking.Status.CONFIRMED: "success",
            Booking.Status.CANCELLED: "danger",
            # Booking.Status.PENDING: "warning",
        },
    )
    def display_status_badge(self, obj):
        return obj.status


@admin.register(BlockedDate)
class BlockedDateAdmin(ModelAdmin):
    list_display = ["user", "start_date", "end_date", "reason"]
    list_filter = ["user"]