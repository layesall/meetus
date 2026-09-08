from django import forms
from django_jsonform.widgets import JSONFormWidget
from django_jsonform.forms.fields import JSONFormField
from apps.bookings.models import Booking, EventType


class EventTypeAdminForm(forms.ModelForm):
    class Meta:
        model = EventType
        fields = "__all__"
        widgets = {
            "included_features": JSONFormWidget(
                schema=EventType.included_features.field.schema
            ),
            "allowed_channels": JSONFormWidget(
                schema=EventType.allowed_channels.field.schema
            ),
            "booking_questions": JSONFormWidget(
                schema=EventType.QUESTIONS_SCHEMA
            ),
        }

class BookingAdminForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = "__all__"
        widgets = {
            "answers": JSONFormWidget(schema=Booking.answers.field.schema)
        }