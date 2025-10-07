import json
from src.agents.reddit.core.pipeline import run_pipeline

if __name__=="__main__":
    with open("src/agents/reddit/sentiment/dataset/sample_posts.json", "r") as f:
        posts = json.load(f)

    result = run_pipeline(posts)
    print(json.dumps(result, indent=2))