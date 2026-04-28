import os
import requests
from dotenv import load_dotenv, find_dotenv

# Simple in-memory session storage
conversations = {}

def get_chat_response(message, session_id="default"):
    # Load .env only if running locally (Vercel provides env vars automatically)
    if not os.getenv("XAI_API_KEY"):
        load_dotenv(find_dotenv())
    
    API_KEY = os.getenv("XAI_API_KEY")

    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    if session_id not in conversations:
        conversations[session_id] = [
            {
                "role": "system",
                "content": """You are EcoBot, a friendly and helpful Carbon Footprint Calculator Chatbot.

IMPORTANT RULES:
1. If the user asks a general question (e.g., "what is a carbon footprint?", "why does it matter?", "hello"), answer it directly and naturally without immediately jumping into the calculator questions.
2. If the user indicates they want to calculate their carbon footprint, or you are in the middle of a calculation, ask them questions **ONE BY ONE**. Do not ask multiple questions at once. Wait for their answer before asking the next question.

To calculate the monthly footprint, you need:
- Transportation: What type of vehicle (bike, car, public transit) and how many km per day?
- Electricity usage: How many units of electricity per month?
- Food habits: Veg or non-veg?

Use these emission factors for calculation:
- Bike: 0.05 kg CO2/km
- Car: 0.2 kg CO2/km
- Electricity: 0.82 kg CO2/unit
- Veg: 1.5 kg/day
- Non-veg: 3 kg/day

Once you have gathered ALL the information (asking one question at a time), calculate the total monthly carbon footprint and give suggestions on how to reduce it."""
            }
        ]

    # Append the user's message to the conversation history
    conversations[session_id].append({"role": "user", "content": message})

    data = {
        "model": "llama-3.3-70b-versatile",
        "messages": conversations[session_id],
        "temperature": 0.7
    }

    try:
        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            bot_reply = response.json()["choices"][0]["message"]["content"]
            # Append the bot's reply to the conversation history
            conversations[session_id].append({"role": "assistant", "content": bot_reply})
            return bot_reply
        else:
            # Revert the user's message since the API call failed
            conversations[session_id].pop()
            return f"API Error: {response.status_code} - {response.text}"

    except Exception as e:
        # Revert the user's message since the API call failed
        conversations[session_id].pop()
        return f"Error: {str(e)}"