from pydantic import BaseModel

from app.models.enums import DisasterType


class GuidanceTopicResponse(BaseModel):
    topic_key: str
    title: str        # resolved to requested language by the endpoint
    steps: list[str]  # resolved to requested language by the endpoint
    disaster_type: DisasterType | None

    class Config:
        from_attributes = True


class AssistantQueryRequest(BaseModel):
    message: str
    language: str = "en"  # "en" | "hi"


class AssistantQueryResponse(BaseModel):
    reply: str
    matched_topic_key: str | None
    steps: list[str] | None
    show_sos_prompt: bool = False


class EmergencyContactResponse(BaseModel):
    id: str
    label: str
    phone_number: str
    scope: str
    state: str | None
    district: str | None

    class Config:
        from_attributes = True
