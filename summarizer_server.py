from flask import Flask, request, jsonify
import torch
import re

app = Flask(__name__)

from transformers import BartTokenizer, BartForConditionalGeneration

print("Loading BART SAMSum model...")
tokenizer = BartTokenizer.from_pretrained("philschmid/bart-large-cnn-samsum")
model = BartForConditionalGeneration.from_pretrained("philschmid/bart-large-cnn-samsum")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
print(f"Model loaded successfully on {device}")


# Summarize a single chunk
def summarize_chunk(text, max_length=100):
    input_text = text.strip().replace("\n", " ")
    input_ids = tokenizer.encode(input_text, return_tensors="pt", truncation=True, max_length=1024).to(device)
    summary_ids = model.generate(
        input_ids,
        max_length=max_length,
        min_length=30,
        length_penalty=2.0,
        num_beams=4,
        early_stopping=True
    )
    return tokenizer.decode(summary_ids[0], skip_special_tokens=True)

# Split long text into chunks
def split_into_chunks(text, chunk_word_limit=400):
    words = text.split()
    return [' '.join(words[i:i + chunk_word_limit]) for i in range(0, len(words), chunk_word_limit)]

# Extract user messages
def extract_user_opinions(text):
    user_msgs = re.findall(r"(User\d+):\s(.+)", text)
    user_opinions = {}
    for user, msg in user_msgs:
        user_opinions.setdefault(user, []).append(msg.strip())
    return user_opinions

# Main summarization
def summarize_long_chat(chat_text, prompt=None):
    if prompt is None:
        prompt = (
            "You are a professional chat summarizer. Read the following conversation and write a short paragraph in third person explaining the flow of the conversation, mentioning key actions, questions, and responses naturally. Do not repeat chat sentences. Use a narrative style as if explaining to someone else what happened."
        )
    
    final_input = f"{prompt}\n\nConversation:\n{chat_text}"

    chunks = split_into_chunks(final_input)

    # Partial summaries
    partial_summaries = [summarize_chunk(chunk) for chunk in chunks]

    # Merge and summarize again if needed
    merged_summary_text = ' '.join(partial_summaries)
    final_summary = summarize_chunk(merged_summary_text, max_length=150)

    user_opinions = extract_user_opinions(chat_text)

    return {
        "prompt_used": prompt,
        "summary": final_summary,
        "user_opinions": user_opinions
    }


@app.route('/summarize', methods=['POST'])
def summarize_chat():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        chat_text = data.get('chat', '')
        prompt = data.get('prompt')  # Let the server use default if not provided
        
        if not chat_text.strip():
            return jsonify({"error": "No chat text provided"}), 400

        result = summarize_long_chat(chat_text, prompt)
        return jsonify(result)

    except Exception as e:
        print(f"Error during summarization: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "model": "BART-base"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
