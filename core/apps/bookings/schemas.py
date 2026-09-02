from datetime import date, datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --- EventType Schemas ---
class EventTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    slug: str
    description: Optional[str] = None
    duration_minutes: int
    buffer_time_minutes: int
    allowed_channels: List[str]
    color: str


# --- Slots Schemas ---
class SlotOut(BaseModel):
    start_time: datetime
    end_time: datetime


class DaySlotsOut(BaseModel):
    date: date
    slots: List[SlotOut]


# --- Booking Schemas ---
class BookingCreateIn(BaseModel):
    event_type_slug: str = Field(..., max_length=100)
    client_name: str = Field(..., min_length=2, max_length=150)
    client_email: EmailStr
    client_phone: Optional[str] = Field(None, max_length=20)
    chosen_channel: str = Field(..., max_length=50)
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
    cancel_token: UUID


# --- Meet Access Schemas (Headless) ---
class MeetAccessOut(BaseModel):
    code: str
    message: Optional[str] = None
    meet_url: Optional[str] = None
    available_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


# --- Cancellation Schemas (Headless) ---
class BookingCancelIn(BaseModel):
    cancel_token: UUID


class BookingCancelOut(BaseModel):
    success: bool
    message: str
    cancelled_at: datetime


# --- Standard Error Response Schema ---
class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None