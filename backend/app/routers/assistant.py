from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.content import GuidanceTopic
from app.schemas.content import AssistantQueryRequest, AssistantQueryResponse, GuidanceTopicResponse

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

# Lightweight keyword routing — deliberately NOT an LLM call. Guidance steps
# must be exact, vetted, government-approved content, not generated text.
# This is a design decision documented in the PRD: lives should not depend
# on a model "probably" being right.
KEYWORD_MAP = {
    "earthquake_now": ["earthquake", "shaking", "tremor", "भूकंप"],
    "flood_warning": ["flood", "water rising", "flooding", "बाढ़"],
    "gas_leak": ["gas", "smell gas", "leak", "गैस"],
    "cyclone_approaching": ["cyclone", "storm", "hurricane", "चक्रवात"],
    "trapped_need_rescue": ["trapped", "stuck", "buried", "फंस"],
    "first_aid_basics": ["first aid", "bleeding", "injury", "wound", "प्राथमिक उपचार"],
}


def resolve_topic(topic: GuidanceTopic, language: str) -> GuidanceTopicResponse:
    if language == "hi":
        return GuidanceTopicResponse(
            topic_key=topic.topic_key, title=topic.title_hi, steps=topic.steps_hi, disaster_type=topic.disaster_type
        )
    return GuidanceTopicResponse(
        topic_key=topic.topic_key, title=topic.title_en, steps=topic.steps_en, disaster_type=topic.disaster_type
    )


@router.get("/topics", response_model=list[GuidanceTopicResponse])
def list_topics(language: str = Query(default="en"), db: Session = Depends(get_db)):
    """Powers the quick-tap suggestion chips — no typing required."""
    topics = db.query(GuidanceTopic).all()
    return [resolve_topic(t, language) for t in topics]


@router.get("/topics/{topic_key}", response_model=GuidanceTopicResponse)
def get_topic(topic_key: str, language: str = Query(default="en"), db: Session = Depends(get_db)):
    topic = db.query(GuidanceTopic).filter(GuidanceTopic.topic_key == topic_key).first()
    if not topic:
        return GuidanceTopicResponse(
            topic_key=topic_key,
            title="Topic not found" if language == "en" else "विषय नहीं मिला",
            steps=[],
            disaster_type=None,
        )
    return resolve_topic(topic, language)


@router.post("/query", response_model=AssistantQueryResponse)
def query_assistant(payload: AssistantQueryRequest, db: Session = Depends(get_db)):
    """
    Free-text entry point. Matches against known guidance topics by keyword.
    If nothing matches, responds with a safe default that always points to
    SOS/helpline rather than guessing — this assistant must never improvise
    safety-critical instructions.
    """
    message_lower = payload.message.lower()
    matched_key = None
    for topic_key, keywords in KEYWORD_MAP.items():
        if any(kw.lower() in message_lower for kw in keywords):
            matched_key = topic_key
            break

    if matched_key:
        topic = db.query(GuidanceTopic).filter(GuidanceTopic.topic_key == matched_key).first()
        if topic:
            resolved = resolve_topic(topic, payload.language)
            return AssistantQueryResponse(
                reply=resolved.title, matched_topic_key=matched_key, steps=resolved.steps, show_sos_prompt=True
            )

    fallback = (
        "I couldn't match that to a known emergency guide. If this is life-threatening, use the SOS button "
        "or call 112 now. Otherwise, try one of the quick topics below."
        if payload.language == "en"
        else "मैं इसे किसी ज्ञात आपातकालीन गाइड से मिला नहीं पाया। यदि यह जीवन के लिए खतरा है, तो SOS बटन का उपयोग करें "
        "या 112 पर कॉल करें। अन्यथा, नीचे दिए गए त्वरित विषयों में से एक आज़माएं।"
    )
    return AssistantQueryResponse(reply=fallback, matched_topic_key=None, steps=None, show_sos_prompt=True)
