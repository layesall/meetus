from django.contrib import admin
from .models import EventType, Availability, Booking, BlockedDate

@admin.register(EventType)
class EventTypeAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "duration_minutes", "is_active", "user")
    prepopulated_fields = {"slug": ("title",)}

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ("user", "day_of_week", "start_time", "end_time")

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("client_name", "client_email", "event_type", "start_time", "status")
    list_filter = ("status", "created_at")

@admin.register(BlockedDate)
class BlockedDateAdmin(admin.ModelAdmin):
    list_display = ("user", "start_date", "end_date", "reason")