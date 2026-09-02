from fastapi import FastAPI

from app.api.health import router as health_router
from app.core.config import settings

app = FastAPI(
    title="OpenSimLab API",
    description="Electronic simulation platform backend",
    version="0.1.0",
    debug=settings.debug,
)

app.include_router(health_router, prefix="/api")
