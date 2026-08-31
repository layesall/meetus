from ninja import NinjaAPI
from apps.bookings.api import router as bookings_router

api = NinjaAPI(
    title="Meetus API",
    version="1.0.0",
    description="API for reservation and scheduling of appointments",
)

# Add the bookings router to the API
api.add_router("bookings/", bookings_router)

@api.get("/health", tags=["System"])
def health_check(request):
    """
    Health check endpoint to verify that the API is running.
    """
    return {"status": "ok", "message": "Meetus APIS is running"}