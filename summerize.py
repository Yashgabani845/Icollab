from transformers import BartTokenizer, BartForConditionalGeneration
import torch
import re

# Load the BART-base model and tokenizer
tokenizer = BartTokenizer.from_pretrained("facebook/bart-base")
model = BartForConditionalGeneration.from_pretrained("facebook/bart-base")

# Summarize a single chunk
def summarize_chunk(text, max_length=100):
    input_text = text.strip().replace("\n", " ")
    input_ids = tokenizer.encode(input_text, return_tensors="pt", truncation=True, max_length=1024)
    summary_ids = model.generate(
        input_ids,
        max_length=max_length,
        min_length=20,
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
def summarize_long_chat(chat_text, prompt="Summarize the chat"):
    print("Splitting chat into chunks...")
    chunks = split_into_chunks(chat_text)
    print(f"Total chunks: {len(chunks)}")

    # Partial summaries
    print("Generating partial summaries...")
    partial_summaries = [summarize_chunk(chunk) for chunk in chunks]

    # Final summary
    merged_summary_text = ' '.join(partial_summaries)
    print("Generating final summary...")
    final_summary = summarize_chunk(merged_summary_text, max_length=150)

    # Extract user data
    user_opinions = extract_user_opinions(chat_text)

    return {
        "prompt": prompt,
        "summary": final_summary,
        "user_opinions": user_opinions
    }

# === Example ===
if __name__ == "__main__":
    sample_chat = """
    User1: Hey, how are you doing today?
    User2: I'm doing well, thanks! Just working on a Python project.
    User1: Nice! What kind of project?
    User2: It's a summarizer for long chat logs using transformers.
    User1: Sounds interesting. Are you using a large model?
    User2: Nope, I'm keeping it lightweight with bart-base and chunking the input.
    """

    result = summarize_long_chat(sample_chat, prompt="Summarize this chat with context and user opinions.")
    print("\n--- Final Summary ---\n")
    print(result["summary"])
    print("\n--- User Opinions ---\n")
    for user, messages in result["user_opinions"].items():
        print(f"{user}:")
        for msg in messages:
            print(f"  - {msg}")
