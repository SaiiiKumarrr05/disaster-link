import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.db.session import get_db
from app.models.enums import PlaceType, UserRole
from app.models.place import Place
from app.schemas.place import PlaceCreateRequest, PlaceResponse

router = APIRouter(prefix="/api/places", tags=["places"])


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(d_lambda / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


@router.get("", response_model=list[PlaceResponse])
def find_nearby_places(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    place_type: PlaceType | None = Query(default=None, description="Filter: shelter | hospital | police_station"),
    radius_km: float = Query(default=25.0, description="Search radius in kilometers"),
    db: Session = Depends(get_db),
):
    """Public endpoint — shelter/hospital/police lookup must never require login.
    Distance filtering done in Python for MVP simplicity; production should use
    PostGIS ST_DWithin for performance at scale.
    """
    query = db.query(Place).filter(Place.is_operational == True)  # noqa: E712
    if place_type:
        query = query.filter(Place.place_type == place_type)

    places = query.all()
    nearby = []
    for place in places:
        distance = haversine_km(lat, lng, place.latitude, place.longitude)
        if distance <= radius_km:
            nearby.append((distance, place))

    nearby.sort(key=lambda x: x[0])
    return [p for _, p in nearby]


@router.get("/{place_id}", response_model=PlaceResponse)
def get_place(place_id: str, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found.")
    return place


@router.post("", response_model=PlaceResponse, status_code=201)
def create_place(
    payload: PlaceCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.authority, UserRole.admin)),
):
    place = Place(**payload.model_dump())
    db.add(place)
    db.commit()
    db.refresh(place)
    return place


@router.patch("/{place_id}/capacity", response_model=PlaceResponse)
def update_capacity(
    place_id: str,
    capacity_occupied: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.authority, UserRole.admin, UserRole.rescue_team)),
):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found.")
    place.capacity_occupied = capacity_occupied
    if place.capacity_total:
        ratio = capacity_occupied / place.capacity_total
        place.capacity_status = "full" if ratio >= 0.95 else "limited" if ratio >= 0.7 else "open"
    db.commit()
    db.refresh(place)
    return place
