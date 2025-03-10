from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the fine-tuned model and tokenizer
model_path = "./final_chat_summary_model"
try:
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_path)
    
    # Move model to GPU if available
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = model.to(device)
    print(f"Model loaded successfully and running on {device}")
except Exception as e:
    print(f"Error loading model: {e}")
    # Fallback to a pretrained model if the fine-tuned one is not available
    print("Loading fallback model: facebook/bart-large-cnn")
    tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")
    model = AutoModelForSeq2SeqLM.from_pretrained("facebook/bart-large-cnn")
    model = model.to("cuda" if torch.cuda.is_available() else "cpu")

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    
    if not data or 'chat' not in data:
        return jsonify({'error': 'Missing chat data'}), 400
    
    chat = data['chat']
    
    try:
        # Tokenize the input chat
        inputs = tokenizer(chat, return_tensors="pt", max_length=1024, truncation=True)
        inputs = {k: v.to(model.device) for k, v in inputs.items()}  # Move inputs to the same device as model
        
        # Generate the summary
        summary_ids = model.generate(
            inputs['input_ids'], 
            max_length=150, 
            num_beams=4, 
            early_stopping=True,
            no_repeat_ngram_size=2
        )
        
        # Decode and return the summary
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        
        return jsonify({'summary': summary})
    
    except Exception as e:
        print(f"Error generating summary: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)