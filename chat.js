// VailethChat - Chat-specific JavaScript Functions

document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
    initializeMessageForm();
    scrollToBottom();
    
    // Auto-refresh messages every 5 seconds (for MVP)
    setInterval(refreshMessages, 5000);
});

function initializeChat() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    // Mark messages as read when they come into view
    markMessagesAsRead();
    
    // Initialize emoji picker placeholder
    initializeEmojiPicker();
    
    // Initialize typing indicator
    initializeTypingIndicator();
}

function initializeMessageForm() {
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    
    if (!messageForm || !messageInput) return;
    
    // Handle form submission
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sendMessage();
    });
    
    // Handle Enter key (but allow Shift+Enter for new lines)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Handle typing indicator
    let typingTimeout;
    messageInput.addEventListener('input', function() {
        showTypingIndicator();
        
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            hideTypingIndicator();
        }, 1000);
    });
    
    // Auto-resize textarea (if needed)
    messageInput.addEventListener('input', autoResizeTextarea);
}

function sendMessage() {
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messagesContainer');
    
    if (!messageForm || !messageInput || !messagesContainer) return;
    
    const content = messageInput.value.trim();
    if (!content) return;
    
    // Disable form while sending
    messageForm.classList.add('sending');
    messageInput.disabled = true;
    
    // Create FormData
    const formData = new FormData(messageForm);
    
    // Send message via AJAX
    fetch('/send_message', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Add message to UI immediately
            addMessageToUI(data.message, true);
            
            // Clear input
            messageInput.value = '';
            messageInput.style.height = 'auto';
            
            // Scroll to bottom
            scrollToBottom();
            
            // Show notification sound
            playMessageSentSound();
        } else {
            showErrorMessage(data.error || 'Failed to send message');
        }
    })
    .catch(error => {
        console.error('Error sending message:', error);
        showErrorMessage('Network error. Please try again.');
    })
    .finally(() => {
        // Re-enable form
        messageForm.classList.remove('sending');
        messageInput.disabled = false;
        messageInput.focus();
    });
}

function addMessageToUI(message, isSent = false) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    // Remove "no messages" placeholder if it exists
    const noMessages = messagesContainer.querySelector('.no-messages');
    if (noMessages) {
        noMessages.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    
    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble';
    
    // Add sender name for group chats (received messages only)
    if (!isSent && message.sender_name) {
        const senderDiv = document.createElement('div');
        senderDiv.className = 'message-sender';
        senderDiv.textContent = message.sender_name;
        messageBubble.appendChild(senderDiv);
    }
    
    // Add message content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message.content;
    messageBubble.appendChild(contentDiv);
    
    // Add time and status
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.innerHTML = `
        ${message.created_at}
        ${isSent ? `<i class="fas fa-check${message.is_delivered ? '-double text-primary' : ' text-muted'} ms-1"></i>` : ''}
    `;
    messageBubble.appendChild(timeDiv);
    
    messageDiv.appendChild(messageBubble);
    messagesContainer.appendChild(messageDiv);
    
    // Animate message appearance
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
    
    requestAnimationFrame(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    });
}

function refreshMessages() {
    // For MVP, we'll use a simple page refresh approach
    // In a real app, this would fetch new messages via WebSocket or AJAX
    const currentChatId = getCurrentChatId();
    if (!currentChatId) return;
    
    // Check for new messages (simplified approach)
    fetch(`/chat/${currentChatId}/messages`)
        .then(response => response.json())
        .then(data => {
            // Update message list if there are new messages
            // This is a simplified implementation
        })
        .catch(error => {
            console.error('Error refreshing messages:', error);
        });
}

function getCurrentChatId() {
    const chatIdInput = document.querySelector('input[name="chat_id"]');
    return chatIdInput ? chatIdInput.value : null;
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function markMessagesAsRead() {
    // Mark all received messages as read
    const currentChatId = getCurrentChatId();
    if (!currentChatId) return;
    
    fetch(`/chat/${currentChatId}/mark_read`, {
        method: 'POST'
    })
    .catch(error => {
        console.error('Error marking messages as read:', error);
    });
}

function showTypingIndicator() {
    // Show typing indicator for other users (in a real app)
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
    }
}

function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

function initializeEmojiPicker() {
    const emojiButton = document.querySelector('.btn[title="Emoji"]');
    if (!emojiButton) return;
    
    emojiButton.addEventListener('click', function() {
        // Simple emoji picker (in a real app, you'd use a proper emoji picker library)
        const emojis = ['😀', '😂', '❤️', '👍', '👎', '😍', '😢', '😮', '😡', '🤔', '👋', '🙏'];
        
        // Create or toggle emoji popup
        let emojiPopup = document.querySelector('.emoji-popup');
        
        if (emojiPopup) {
            emojiPopup.remove();
            return;
        }
        
        emojiPopup = document.createElement('div');
        emojiPopup.className = 'emoji-popup position-absolute bg-white border rounded shadow p-2';
        emojiPopup.style.bottom = '100%';
        emojiPopup.style.right = '0';
        emojiPopup.style.zIndex = '1000';
        emojiPopup.style.display = 'grid';
        emojiPopup.style.gridTemplateColumns = 'repeat(6, 1fr)';
        emojiPopup.style.gap = '0.25rem';
        emojiPopup.style.marginBottom = '0.5rem';
        
        emojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.type = 'button';
            emojiBtn.className = 'btn btn-sm';
            emojiBtn.textContent = emoji;
            emojiBtn.style.fontSize = '1.2rem';
            
            emojiBtn.addEventListener('click', () => {
                const messageInput = document.getElementById('messageInput');
                if (messageInput) {
                    messageInput.value += emoji;
                    messageInput.focus();
                }
                emojiPopup.remove();
            });
            
            emojiPopup.appendChild(emojiBtn);
        });
        
        emojiButton.parentNode.style.position = 'relative';
        emojiButton.parentNode.appendChild(emojiPopup);
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeEmojiPopup(e) {
                if (!emojiPopup.contains(e.target) && e.target !== emojiButton) {
                    emojiPopup.remove();
                    document.removeEventListener('click', closeEmojiPopup);
                }
            });
        }, 100);
    });
}

function initializeTypingIndicator() {
    // Create typing indicator element
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator message received';
    typingIndicator.style.display = 'none';
    
    typingIndicator.innerHTML = `
        <div class="message-bubble">
            <div class="typing-dots">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingIndicator);
}

function autoResizeTextarea() {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput) return;
    
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

function showErrorMessage(message) {
    // Create toast notification for errors
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-danger border-0 position-fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-exclamation-circle me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Auto-remove after toast is hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Sound effects
function playMessageSentSound() {
    // Create a simple sound effect using Web Audio API
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Audio not available:', error);
        }
    }
}

function playMessageReceivedSound() {
    // Similar to sent sound but different tone
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio not available:', error);
        }
    }
}

// Export functions for global use
window.addMessageToUI = addMessageToUI;
window.scrollToBottom = scrollToBottom;
window.playMessageReceivedSound = playMessageReceivedSound;
