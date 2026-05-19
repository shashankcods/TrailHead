import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["PYTORCH_MPS_HIGH_WATERMARK_RATIO"] = "0.0"
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"] = "1"
os.environ["REQUESTS_CA_BUNDLE"] = "/etc/ssl/cert.pem"
os.environ["HF_HUB_DOWNLOAD_TIMEOUT"] = "1200"
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"

from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from sklearn.model_selection import train_test_split
from datasets import Dataset
import pandas as pd
import torch

MODEL = "cardiffnlp/twitter-roberta-base-sentiment-latest"

tokenizer = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForSequenceClassification.from_pretrained(MODEL, num_labels=3)

df = pd.read_csv("src/agents/reddit/sentiment/dataset/reddit_sentiment_dataset.csv", header=0)
df = df[df["sentiment"].apply(lambda x: str(x).isdigit())]
x = df["snippet"].astype(str).tolist()
y = df["sentiment"].astype(int).tolist()

x_train, x_val, y_train, y_val = train_test_split(x, y, test_size=0.2, random_state=42)

def tokenize(batch):
    return tokenizer(batch["text"], padding="max_length", truncation=True, max_length=128)

train_dataset = Dataset.from_dict({"text": x_train, "label": y_train})
val_dataset = Dataset.from_dict({"text": x_val, "label": y_val})

train_dataset = train_dataset.map(tokenize, batched=True)
val_dataset = val_dataset.map(tokenize, batched=True)

train_dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "label"])
val_dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "label"])

training_args = TrainingArguments(
    output_dir="src/agents/reddit/sentiment/model/results",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    eval_strategy="epoch",
    save_strategy="epoch",
    logging_dir="src/agents/reddit/sentiment/model/logs",
    logging_steps=10,
    learning_rate=2e-5,
)

device = torch.device("cpu")
model.to(device)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset
)

trainer.train()

model.save_pretrained("src/agents/reddit/sentiment/model/fine_tuned_roberta")
tokenizer.save_pretrained("src/agents/reddit/sentiment/model/fine_tuned_roberta")
