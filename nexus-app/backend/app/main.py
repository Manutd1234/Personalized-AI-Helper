from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ai

app = FastAPI(
    title="Nexus API",
    description="AI-powered productivity assistant backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai.router, prefix="/api", tags=["AI"])

@app.get("/")
async def root():
    return {"message": "Nexus API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
