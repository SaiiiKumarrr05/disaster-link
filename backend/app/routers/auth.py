from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_required
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.auth import LoginRequest, ProfileResponse, SignupRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(Profile).filter(Profile.phone == payload.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this phone number already exists.")

    profile = Profile(
        full_name=payload.full_name,
        phone=payload.phone,
        role=payload.role,
        preferred_language=payload.preferred_language,
        rescue_unit_name=payload.rescue_unit_name,
        district=payload.district,
        state=payload.state,
        hashed_password=hash_password(payload.password),
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    token = create_access_token(subject=profile.id, role=profile.role.value)
    return TokenResponse(access_token=token, role=profile.role, full_name=profile.full_name)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.phone == payload.phone).first()
    if not profile or not verify_password(payload.password, profile.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid phone number or password.")

    token = create_access_token(subject=profile.id, role=profile.role.value)
    return TokenResponse(access_token=token, role=profile.role, full_name=profile.full_name)


@router.get("/me", response_model=ProfileResponse)
def get_me(current_user: Profile = Depends(get_current_user_required)):
    return current_user
