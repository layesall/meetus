from ninja_extra import NinjaExtraAPI
from ninja_jwt.controller import NinjaJWTDefaultController
from apps.bookings.api import public_router, admin_router

# Utilisation de NinjaExtraAPI au lieu de NinjaAPI
api = NinjaExtraAPI(
    title="Meetus API",
    version="1.0.0",
    description="API for reservation and scheduling of appointments",
)

# Enregistrement officiel du contrôleur JWT
api.register_controllers(NinjaJWTDefaultController)

# Public endpoints
api.add_router("/bookings/", public_router)

# Protected admin endpoints
api.add_router("/admin/bookings/", admin_router)


@api.get("/health", tags=["System"])
def health_check(request):
    """Vérification de l'état de l'API"""
    return {"status": "ok", "message": "Meetus API is running"}