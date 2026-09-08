from datetime import date, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --- Question & Custom Fields Schemas ---
class BookingQuestionSchema(BaseModel):
    id: str
    label: str
    type: str  # text, textarea, number, select
    required: bool = True
    options: Optional[List[str]] = None


# --- EventType Schemas ---
class EventTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    slug: str
    description: Optional[str] = None
    included_features: List[str] = []
    price: float
    currency: str
    duration_minutes: int
    is_custom_duration_allowed: bool
    buffer_time_minutes: int
    allowed_channels: List[str]
    booking_questions: List[BookingQuestionSchema] = []
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
    duration_minutes: Optional[int] = Field(None, help_text="Provide only if is_custom_duration_allowed is True.")
    answers: Dict[str, Any] = Field(default_factory=dict, help_text="Dictionary of client answers to custom fields.")


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    client_name: str
    client_email: str
    client_phone: Optional[str] = None
    chosen_channel: str
    start_time: datetime
    end_time: datetime
    total_price: float
    answers: Dict[str, Any]
    google_meet_link: Optional[str] = None
    status: str
    cancel_token: UUID


# --- Meet Access Schemas ---
class MeetAccessOut(BaseModel):
    code: str
    message: Optional[str] = None
    meet_url: Optional[str] = None
    available_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


# --- Cancellation Schemas ---
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