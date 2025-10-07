from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

MODEL_PATH = "src/agents/reddit/sentiment/model/fine_tuned_roberta"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

text = "The trip was absolutely amazing and unforgettable!"
inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
with torch.no_grad():
    outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    prediction = torch.argmax(probs, dim=-1).item()

print("Predicted sentiment:", prediction)
