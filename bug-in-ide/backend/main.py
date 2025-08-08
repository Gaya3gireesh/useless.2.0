from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.game import router as game_router

from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Register game routes
app.include_router(game_router, prefix="/api")

# Serve frontend build
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

@app.get("/api/")
def root():
    return {"status": "ok"}

# Add CORS preflight handler
@app.options("/{path:path}")
def options_handler():
    return {"message": "OK"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
