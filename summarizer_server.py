# summarizer_server.py

from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

app = Flask(__name__)

# Load the fine-tuned model
try:
    model_path = "./final_chat_summary_model"  # Update if model path different
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_path)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    
    # Set decoder_start_token_id
    model.config.decoder_start_token_id = model.config.pad_token_id  # or another suitable token
    print("Model and tokenizer loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")

@app.route('/summarize', methods=['POST'])
def summarize_chat():
    try:
        data = request.get_json()
        chat_text = data.get('chat', '')

        if not chat_text.strip():
            return jsonify({"summary": "No chat provided."}), 400

        # Tokenize the input text
        inputs = tokenizer(chat_text, return_tensors="pt", max_length=1024, truncation=True).to(device)

        # Generate summary
        summary_ids = model.generate(
            inputs['input_ids'], 
            max_length=128, 
            num_beams=4, 
            early_stopping=True,
            decoder_start_token_id=model.config.decoder_start_token_id
        )

        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

        return jsonify({"summary": summary})
    except Exception as e:
        print(f"Error during summarization: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
