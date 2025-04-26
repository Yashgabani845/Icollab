import sys
import os
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

model_name = "facebook/bart-large-cnn"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

def summarize_chat(chat_file_path):
    if not os.path.exists(chat_file_path):
        print(f"Error: File '{chat_file_path}' not found.")
        sys.exit(1)

    with open(chat_file_path, 'r') as file:
        chat = file.read()

    inputs = tokenizer(chat, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = model.generate(inputs['input_ids'], max_length=128, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    
    return summary

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No chat file path provided.")
        sys.exit(1)

    chat_file_path = sys.argv[1]
    summary = summarize_chat(chat_file_path)
    print(summary)
