"""
Shared enum definitions mirroring the Postgres ENUM types in
docs/07-supabase-schema.sql. Kept in one module so model and schema
layers reference the same source of truth.
"""
import enum


class UserRole(str, enum.Enum):
    citizen = "citizen"
    rescue_team = "rescue_team"
    authority = "authority"
    admin = "admin"


class AlertSeverity(str, enum.Enum):
    advisory = "advisory"
    warning = "warning"
    critical = "critical"


class DisasterType(str, enum.Enum):
    flood = "flood"
    cyclone = "cyclone"
    earthquake = "earthquake"
    fire = "fire"
    landslide = "landslide"
    heatwave = "heatwave"
    other = "other"


class SOSCategory(str, enum.Enum):
    medical = "medical"
    trapped = "trapped"
    fire = "fire"
    flood = "flood"
    other = "other"


class SOSStatus(str, enum.Enum):
    submitted = "submitted"
    acknowledged = "acknowledged"
    en_route = "en_route"
    resolved = "resolved"
    cancelled = "cancelled"


class SOSPriority(str, enum.Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class PlaceType(str, enum.Enum):
    shelter = "shelter"
    hospital = "hospital"
    police_station = "police_station"


class ShelterCapacityStatus(str, enum.Enum):
    open = "open"
    limited = "limited"
    full = "full"
