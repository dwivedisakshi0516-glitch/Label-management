import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.database.mongodb import connect_to_mongo, close_mongo_connection, db_manager
from backend.app.services.seed_data import seed_initial_data

from backend.app.routes.auth import router as auth_router
from backend.app.routes.categories import router as categories_router
from backend.app.routes.manufacturers import router as manufacturers_router
from backend.app.routes.customer_care import router as customer_care_router
from backend.app.routes.warranties import router as warranties_router
from backend.app.routes.products import router as products_router
from backend.app.routes.templates import router as templates_router
from backend.app.routes.labels import router as labels_router
from backend.app.routes.settings import router as settings_router
from backend.app.routes.dashboard import router as dashboard_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing RIT Label Precision Suite Backend...")
    await connect_to_mongo()
    await seed_initial_data()
    yield
    logger.info("Shutting down backend...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Set CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def ensure_database_connection(request, call_next):
    await db_manager.ensure_connected()
    return await call_next(request)

# Include API Routers
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(categories_router, prefix=api_prefix)
app.include_router(manufacturers_router, prefix=api_prefix)
app.include_router(customer_care_router, prefix=api_prefix)
app.include_router(warranties_router, prefix=api_prefix)
app.include_router(products_router, prefix=api_prefix)
app.include_router(templates_router, prefix=api_prefix)
app.include_router(labels_router, prefix=api_prefix)
app.include_router(settings_router, prefix=api_prefix)
app.include_router(dashboard_router, prefix=api_prefix)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "docs": f"{settings.API_V1_STR}/docs"
    }

@app.get("/api/health")
async def health_check():
    await db_manager.ensure_connected()
    return {
        "status": "ok",
        "message": "RIT Label Suite API is fully operational",
        "database": "live" if not db_manager.is_fallback else "fallback",
        "database_name": settings.DATABASE_NAME if not db_manager.is_fallback else None,
        "database_warning": "Using file-backed fallback store because MongoDB is unavailable. Start MongoDB or set MONGODB_URL to use the primary database." if db_manager.is_fallback else None,
    }
