from django.contrib import admin
from django.urls import include, path
from .api import api

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', api.urls),
    path("api/v1/bookings/", include("apps.bookings.urls")),
]