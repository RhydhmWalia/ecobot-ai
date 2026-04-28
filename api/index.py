import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import the response logic from engine.py in the same directory
try:
    from .engine import get_chat_response
except ImportError:
    from engine import get_chat_response

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

@app.route('/', methods=['POST'])
@app.route('/chat', methods=['POST'])
def chat():
    # Handle empty or invalid requests
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    user_message = data.get('message', '').strip()
    session_id = data.get('session_id', 'default')

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    # Get response from the engine layer
    try:
        result = get_chat_response(user_message, session_id)
    except Exception as e:
        return jsonify({"error": f"Internal Logic Error: {str(e)}"}), 500

    if result.startswith("Error:") or result.startswith("API Error:"):
        return jsonify({"error": result}), 500

    return jsonify({"response": result})

# Vercel needs the 'app' object, but we keep this for local testing
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)