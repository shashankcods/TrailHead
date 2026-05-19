from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

MODEL_NAME = "google/flan-t5-large"

# Load tokenizer + model
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

# Create summarization pipeline
summarizer = pipeline("text2text-generation", model=model, tokenizer=tokenizer)

def summarize_texts(texts):
    summaries = []
    for text in texts:
        prompt = f"""
Summarize this Reddit travel discussion into 2–3 short, practical travel tips.
Focus on local experiences, hidden gems, and safety advice.

Post:
{text}
"""
        try:
            output = summarizer(
                prompt,
                max_length=100,
                min_length=25,
                do_sample=False
            )[0]["generated_text"]
            summaries.append(output)
        except Exception as e:
            summaries.append(f"Error summarizing post: {str(e)}")
    return summaries
