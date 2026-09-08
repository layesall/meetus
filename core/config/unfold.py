# Configuration Unfold alignée sur la Charte Graphique MeetUs
from django.conf import settings

UNFOLD_DESIGN = {
    "SITE_TITLE": "Meetus Admin",
    "SITE_HEADER": "Meetus Dashboard",
    "SITE_SUBHEADER": "Booking & Appointment Management",
    "SITE_URL": "/",
    "SHOW_HISTORY": True,
    # "THEME": "dark",
    "BORDER_RADIUS": "8px",

    # CSS personnalisé pour les champs django-jsonform
    "STYLES": [
        lambda request: settings.BASE_DIR / "",
    ],

    # Palette "Meetus" (Bleu Accent #2563EB en Primary)
    "COLORS": {
        "primary": {
            "50": "239 246 255",
            "100": "219 234 254",
            "200": "191 219 254",
            "300": "147 197 253",
            "400": "96 165 250",
            "500": "37 99 235",
            "600": "29 78 216",
            "700": "30 58 138",
            "800": "30 41 59",
            "900": "0 28 64",
            "950": "15 23 42",
        },
    },

    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Appointments",
                "separator": True,
                "items": [
                    {
                        "title": "Bookings",
                        "icon": "calendar_today",
                        "link": lambda request: "/admin/bookings/booking/",
                    },
                    {
                        "title": "Blocked Dates",
                        "icon": "block",
                        "link": lambda request: "/admin/bookings/blockeddate/",
                    },
                ],
            },
            {
                "title": "Configuration",
                "separator": True,
                "items": [
                    {
                        "title": "Event Types",
                        "icon": "event",
                        "link": lambda request: "/admin/bookings/eventtype/",
                    },
                    {
                        "title": "Availability Rules",
                        "icon": "schedule",
                        "link": lambda request: "/admin/bookings/availabilityrule/",
                    },
                ],
            },
            {
                "title": "Users & Access",
                "separator": True,
                "items": [
                    {
                        "title": "Users",
                        "icon": "people",
                        "link": lambda request: "/admin/auth/user/",
                    },
                ],
            },
        ],
    },
}