import re
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_PATH = "src/agents/reddit/sentiment/model/fine_tuned_roberta"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

def predict_sentiment(texts):
    inputs = tokenizer(
        texts, return_tensors="pt", truncation=True, padding=True, max_length=128
    )
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
        return torch.argmax(probs, dim=-1).tolist()

def run_pipeline(posts):
    """Filter junk, predict sentiment, and return top 10 positive Reddit posts."""
    blocked_patterns = [
        r"\b(lol|haha|thanks|okay|sure|haan|cfbr)\b",
        r"vo sab dekh lenge",
        r"\[deleted\]",
        r"\[removed\]",
    ]

    cleaned_posts = []
    for post in posts:
        title = post.get("title", "No title")
        comment = (post.get("comment") or post.get("snippet") or "").strip()

        # Normalize text
        clean_comment = re.sub(r"[\s\"']+", " ", comment).strip().lower()

        if len(clean_comment) < 5:
            continue
        if any(re.search(pat, clean_comment, re.IGNORECASE) for pat in blocked_patterns):
            continue
        if not re.search(r"[a-zA-Z]{4,}", clean_comment):
            continue

        cleaned_posts.append({"title": title, "comment": comment})

    if not cleaned_posts:
        return {"useful_posts": 0, "posts": []}

    texts = [f"{p['title']}. {p['comment']}" for p in cleaned_posts]
    sentiments = predict_sentiment(texts)

    positive_posts = [
        cleaned_posts[i]
        for i, s in enumerate(sentiments)
        if s in [1, 2]  # include neutral + positive
    ]

    # Fallback: if too few positive posts, show cleaned ones
    if len(positive_posts) < 5:
        print("⚠️ Using fallback mode: not enough positive posts.")
        positive_posts = cleaned_posts[:10]

    print("🔍 Total posts received:", len(posts))
    print("✅ After regex cleaning:", len(cleaned_posts))
    print("🧠 Positive sentiment posts:", len(positive_posts))

    return {
        "useful_posts": len(positive_posts),
        "posts": positive_posts[:20],
    }
