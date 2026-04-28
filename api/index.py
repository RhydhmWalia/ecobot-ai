import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Import the response logic from engine.py in the same directory
try:
    from .engine import get_chat_response
except ImportError:
    from engine import get_chat_response

# Point static folder to frontend directory
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
app = Flask(__name__, static_folder=frontend_dir, static_url_path='')

# Enable CORS for all routes
CORS(app)

@app.route('/', methods=['GET', 'POST'])
def home():
    # If it's a POST request, it's coming from the /chat rewrite (Vercel)
    if request.method == 'POST':
        return chat()
    # If it's a GET request, serve the frontend (Render)
    return send_from_directory(app.static_folder, 'index.html')

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

# Vercel/Render need the 'app' object, but we keep this for local testing
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)