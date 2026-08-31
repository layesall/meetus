from datetime import datetime, date, time
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# --- EventType Schemas ---
class EventTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    slug: str
    description: Optional[str] = None
    duration_minutes: int
    allowed_channels: List[str]
    color: str

# --- Slots Schemas (Créneaux libres) ---
class SlotOut(BaseModel):
    start_time: datetime
    end_time: datetime

class DaySlotsOut(BaseModel):
    date: date
    slots: List[SlotOut]

# --- Booking Schemas (Création de RDV) ---
class BookingCreateIn(BaseModel):
    event_type_slug: str
    client_name: str = Field(..., min_length=2, max_length=150)
    client_email: EmailStr
    client_phone: Optional[str] = None
    chosen_channel: str
    start_time: datetime

class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    client_name: str
    client_email: str
    chosen_channel: str
    start_time: datetime
    end_time: datetime
    google_meet_link: Optional[str] = None
    status: str