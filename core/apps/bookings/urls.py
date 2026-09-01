# booking/urls.py
from django.urls import path
from .views import CancelBookingView

urlpatterns = [
    path("cancel/<str:token>/", CancelBookingView.as_view(), name="booking_cancel"),
]