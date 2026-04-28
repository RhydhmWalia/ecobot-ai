# Carbon Footprint Calculator Chatbot

A simple web-based chatbot built with Python (Flask) and HTML/CSS/JS that helps users calculate their monthly carbon footprint and provides suggestions to reduce it. It utilizes the OpenAI API to conduct a step-by-step conversation.

## Requirements
- Python 3.7+
- OpenAI API Key

## Setup Instructions

1. **Install Dependencies**
   Open your terminal and run the following command to install the required Python packages:
   ```bash
   pip install flask flask-cors python-dotenv openai
   ```

2. **Configure Environment Variables**
   Open the `.env` file in the root directory and replace `your_openai_api_key_here` with your actual OpenAI API key.
   ```
   OPENAI_API_KEY=sk-...
   ```
   *The `.env` file is used to securely store sensitive information like API keys so they are not hardcoded into your source code.*

3. **Run the Backend Server**
   Navigate to the `backend` folder and start the Flask application:
   ```bash
   cd backend
   python app.py
   ```
   The backend will start running at `http://localhost:5000`.

4. **Launch the Frontend**
   Simply open the `frontend/index.html` file in your web browser. 
   You can do this by double-clicking the file in your file explorer or by right-clicking it and selecting "Open with > [Your Browser]".

## Usage
Type your responses in the chat window. The bot will guide you through questions about your transportation, electricity, and food habits to calculate your footprint.
