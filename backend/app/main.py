from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import alerts, assistant, auth, emergency_contacts, places, sos

app = FastAPI(
    title=settings.app_name,
    description=(
        "Backend API for DisasterLink AI — a government-grade emergency response "
        "platform covering alerts, shelter/hospital/police lookup, SOS reporting, "
        "rescue team triage, and bilingual emergency guidance."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(alerts.router)
app.include_router(places.router)
app.include_router(sos.router)
app.include_router(emergency_contacts.router)
app.include_router(assistant.router)


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok", "service": settings.app_name, "environment": settings.environment}
