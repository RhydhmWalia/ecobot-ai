const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const recentChatsContainer = document.getElementById('recent-chats-container');
let chips = document.querySelectorAll('.chip');

// We save the HTML structure of the welcome container so we can restore it for new chats
const welcomeContainerTemplate = document.getElementById('welcome-container')?.outerHTML || '';

let sessionId = "user_" + Math.random().toString(36).substring(7);
let chatHistory = JSON.parse(localStorage.getItem('ecoBotHistory')) || [];

function init() {
    bindChips();
    updateSidebar();
}

function bindChips() {
    chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            userInput.value = chip.innerText;
            sendMessage();
        });
    });
}

function saveHistory() {
    localStorage.setItem('ecoBotHistory', JSON.stringify(chatHistory));
}

function updateSidebar() {
    recentChatsContainer.innerHTML = '<p class="section-title">RECENT ACTIVITY</p>';
    
    // Reverse the array so the newest chat is at the top
    const reversedHistory = [...chatHistory].reverse();
    
    reversedHistory.forEach(chat => {
        const item = document.createElement('div');
        item.classList.add('chat-history-item');
        if (chat.id === sessionId) {
            item.classList.add('active');
        }
        
        item.innerHTML = `
            <div class="chat-history-item-content">
                <div class="item-icon">💬</div>
                <span>${chat.title}</span>
            </div>
            <button class="delete-chat-btn" title="Delete Chat" data-id="${chat.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        `;
        
        const contentDiv = item.querySelector('.chat-history-item-content');
        contentDiv.addEventListener('click', () => loadChat(chat.id));
        
        const deleteBtn = item.querySelector('.delete-chat-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent clicking the item
            deleteChat(chat.id);
        });

        recentChatsContainer.appendChild(item);
    });
}

function deleteChat(id) {
    chatHistory = chatHistory.filter(c => c.id !== id);
    saveHistory();
    
    if (sessionId === id) {
        // If we deleted the active chat, clear the screen and start a new one
        sessionId = "user_" + Math.random().toString(36).substring(7);
        chatWindow.innerHTML = welcomeContainerTemplate;
        bindChips();
    }
    
    updateSidebar();
}

function loadChat(id) {
    const chat = chatHistory.find(c => c.id === id);
    if (!chat) return;
    
    sessionId = id;
    
    // Clear chat window
    chatWindow.innerHTML = '';
    
    // Render messages
    if (chat.messages.length === 0) {
        chatWindow.innerHTML = welcomeContainerTemplate;
        bindChips();
    } else {
        chat.messages.forEach(msg => {
            renderMessage(msg.text, msg.sender);
        });
    }
    
    updateSidebar();
}

newChatBtn.addEventListener('click', () => {
    sessionId = "user_" + Math.random().toString(36).substring(7);
    chatWindow.innerHTML = welcomeContainerTemplate;
    bindChips();
    updateSidebar();
});

function renderMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    
    if (sender === 'bot') {
        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('bot-avatar-icon');
        avatarDiv.innerHTML = '🌿';
        msgDiv.appendChild(avatarDiv);
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.innerHTML = text.replace(/\n/g, '<br>');
    
    msgDiv.appendChild(contentDiv);
    chatWindow.appendChild(msgDiv);
    
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addMessage(text, sender) {
    // Remove welcome container on first message
    const welcomeContainer = document.getElementById('welcome-container');
    if (welcomeContainer) {
        welcomeContainer.style.animation = 'scaleIn 0.3s reverse forwards';
        setTimeout(() => welcomeContainer.remove(), 300);
    }

    renderMessage(text, sender);
    
    // Save to history
    let chat = chatHistory.find(c => c.id === sessionId);
    if (!chat) {
        // First message of a new chat
        const title = text.length > 20 ? text.substring(0, 20) + "..." : text;
        chat = { id: sessionId, title: title, messages: [] };
        chatHistory.push(chat);
    }
    
    chat.messages.push({ sender: sender, text: text });
    saveHistory();
    updateSidebar();
}

function showTyping() {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'bot');
    msgDiv.id = 'typing-indicator-msg';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('bot-avatar-icon');
    avatarDiv.innerHTML = '🌿';
    msgDiv.appendChild(avatarDiv);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.innerHTML = `
        <div class="typing-indicator" style="display:flex;gap:4px;align-items:center;padding:5px 0;">
            <div class="dot" style="width:6px;height:6px;background:#94a3b8;border-radius:50%;animation:bounce 1.4s infinite ease-in-out both;animation-delay:-0.32s"></div>
            <div class="dot" style="width:6px;height:6px;background:#94a3b8;border-radius:50%;animation:bounce 1.4s infinite ease-in-out both;animation-delay:-0.16s"></div>
            <div class="dot" style="width:6px;height:6px;background:#94a3b8;border-radius:50%;animation:bounce 1.4s infinite ease-in-out both;"></div>
        </div>
    `;
    
    msgDiv.appendChild(contentDiv);
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTyping() {
    const typing = document.getElementById('typing-indicator-msg');
    if (typing) {
        typing.remove();
    }
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    
    addMessage(text, 'user');
    userInput.value = '';
    
    showTyping();
    
    try {
        // Automatically switch between local backend and Vercel production backend
        const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:5000/chat'
            : '/chat';

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text, session_id: sessionId })
        });
        
        removeTyping();
        
        if (!response.ok) {
            addMessage("Oops! I'm having trouble reaching my brain. Is the backend server running?", 'bot');
            return;
        }
        
        const data = await response.json();
        if (data.response) {
            addMessage(data.response, 'bot');
        } else if (data.error) {
            addMessage("Error: " + data.error, 'bot');
        } else {
            addMessage("Sorry, I encountered an error. 🍃", 'bot');
        }
    } catch (error) {
        removeTyping();
        addMessage("Oops! Connection error. Make sure the backend is running.", 'bot');
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initialize app
init();
