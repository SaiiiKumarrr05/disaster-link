"""
Central import point for all SQLAlchemy models. Importing this module
guarantees every table is registered on Base.metadata — required before
calling Base.metadata.create_all(), and good practice for Alembic
autogenerate in the production migration path.
"""
from app.models.alert import Alert, RiskIndicator  # noqa: F401
from app.models.content import EmergencyContact, GuidanceTopic  # noqa: F401
from app.models.place import Place  # noqa: F401
from app.models.profile import Profile  # noqa: F401
from app.models.sos import SOSRequest, SOSStatusHistory  # noqa: F401
