from pydantic import BaseModel, Field

from app.models.enums import UserRole


class SignupRequest(BaseModel):
    full_name: str
    phone: str | None = None
    password: str = Field(min_length=6)
    role: UserRole = UserRole.citizen
    preferred_language: str = "en"
    rescue_unit_name: str | None = None
    district: str | None = None
    state: str | None = None


class LoginRequest(BaseModel):
    phone: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    full_name: str


class ProfileResponse(BaseModel):
    id: str
    full_name: str
    phone: str | None
    role: UserRole
    preferred_language: str
    rescue_unit_name: str | None
    district: str | None
    state: str | None

    class Config:
        from_attributes = True
