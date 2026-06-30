from pydantic import BaseModel

from app.models.enums import PlaceType, ShelterCapacityStatus


class PlaceResponse(BaseModel):
    id: str
    name: str
    place_type: PlaceType
    latitude: float
    longitude: float
    address: str | None
    phone: str | None
    capacity_total: int | None
    capacity_occupied: int | None
    capacity_status: ShelterCapacityStatus | None
    is_operational: bool

    class Config:
        from_attributes = True


class PlaceCreateRequest(BaseModel):
    name: str
    place_type: PlaceType
    latitude: float
    longitude: float
    address: str | None = None
    phone: str | None = None
    capacity_total: int | None = None
    capacity_occupied: int | None = None
    capacity_status: ShelterCapacityStatus | None = None
