from flask import Flask, request, jsonify
from flask_cors import CORS
from api import get_chat_response

app = Flask(__name__)
# Enable CORS for all routes so the frontend can communicate with the backend
CORS(app)

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

    # Get response from the API layer
    result = get_chat_response(user_message, session_id)

    if result.startswith("Error:") or result.startswith("API Error:"):
        # Return 500 if there's an internal error from the API
        return jsonify({"error": result}), 500

    return jsonify({"response": result})

if __name__ == '__main__':
    # Run the Flask app on localhost, port 5000
    app.run(debug=True, host='localhost', port=5000)

@app.route("/")
def home():
    return "Backend is running"