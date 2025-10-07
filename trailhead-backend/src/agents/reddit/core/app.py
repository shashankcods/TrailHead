from fastapi import FastAPI, Request
from .pipeline import run_pipeline
import uvicorn

app = FastAPI(
    title="TrailHead Reddit Travel Agent",
    description="Fetches Reddit posts and filters them using sentiment analysis",
    version="1.0.0"
)

@app.post("/api/analyze")
async def analyze(request: Request):
    data = await request.json()
    posts = data.get("posts", [])
    result = run_pipeline(posts)
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
