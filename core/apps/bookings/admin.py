from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.decorators import display

from .models import AvailabilityRule, BlockedDate, Booking, EventType


@admin.register(EventType)
class EventTypeAdmin(ModelAdmin):
    list_display = ("title", "duration_minutes", "buffer_time_minutes", "is_active")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "description")
    list_filter = ("is_active",)


@admin.register(AvailabilityRule)
class AvailabilityRuleAdmin(ModelAdmin):
    list_display = ("get_day_of_week_display", "start_time", "end_time")
    list_filter = ("day_of_week",)
    ordering = ("day_of_week", "start_time")


@admin.register(BlockedDate)
class BlockedDateAdmin(ModelAdmin):
    list_display = ("reason_display", "start_date", "end_date")
    list_display_links = ("reason_display", "start_date")
    search_fields = ("reason",)
    list_filter = ("start_date", "end_date")
    ordering = ("-start_date",)

    @display(description="Reason")
    def reason_display(self, obj):
        """Affiche un texte par défaut si la raison est vide."""
        return obj.reason if obj.reason else "(No reason provided)"


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
    search_fields = ["client_name", "client_email", "google_event_id", "cancel_token"]
    ordering = ["-start_time"]
    readonly_fields = ["google_event_id", "google_meet_link", "cancel_token", "created_at"]

    @display(
        description="Statut",
        label={
            Booking.Status.CONFIRMED: "success",
            Booking.Status.CANCELLED: "danger",
            Booking.Status.COMPLETED: "info",
        },
    )
    def display_status_badge(self, obj):
        return obj.status