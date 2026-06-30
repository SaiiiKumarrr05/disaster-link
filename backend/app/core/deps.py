from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.profile import Profile

# auto_error=False so SOS and other public endpoints can opt out of requiring a token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Profile | None:
    """Returns the authenticated profile, or None if no/invalid token.
    Endpoints that REQUIRE auth should use get_current_user_required instead.
    Endpoints like SOS creation use this so anonymous citizens are still served.
    """
    if token is None:
        return None
    payload = decode_access_token(token)
    if payload is None:
        return None
    user = db.query(Profile).filter(Profile.id == payload.get("sub")).first()
    return user


def get_current_user_required(
    user: Profile | None = Depends(get_current_user),
) -> Profile:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


def require_role(*allowed_roles: UserRole):
    def checker(user: Profile = Depends(get_current_user_required)) -> Profile:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of the following roles: {[r.value for r in allowed_roles]}",
            )
        return user

    return checker
