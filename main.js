// VailethChat - Main JavaScript Functions

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[title]');
    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip);
    });

    // Initialize search functionality
    initializeSearch();
    
    // Initialize responsive features
    initializeMobileFeatures();
    
    // Initialize notification permission
    requestNotificationPermission();
});

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            hideSearchResults();
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.search-container')) {
            hideSearchResults();
        }
    });
}

function performSearch(query) {
    fetch(`/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            displaySearchResults(data);
        })
        .catch(error => {
            console.error('Search error:', error);
        });
}

function displaySearchResults(results) {
    // Remove existing search results
    hideSearchResults();
    
    const searchContainer = document.querySelector('.search-container');
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'search-results position-absolute w-100 bg-white border rounded-bottom shadow-lg';
    resultsDiv.style.top = '100%';
    resultsDiv.style.zIndex = '1000';
    resultsDiv.style.maxHeight = '300px';
    resultsDiv.style.overflowY = 'auto';
    
    let hasResults = false;
    
    // Display users
    if (results.users && results.users.length > 0) {
        hasResults = true;
        const usersHeader = document.createElement('div');
        usersHeader.className = 'p-2 bg-light border-bottom';
        usersHeader.innerHTML = '<small class="text-muted fw-bold">USERS</small>';
        resultsDiv.appendChild(usersHeader);
        
        results.users.forEach(user => {
            const userItem = createSearchUserItem(user);
            resultsDiv.appendChild(userItem);
        });
    }
    
    // Display messages
    if (results.messages && results.messages.length > 0) {
        hasResults = true;
        const messagesHeader = document.createElement('div');
        messagesHeader.className = 'p-2 bg-light border-bottom';
        messagesHeader.innerHTML = '<small class="text-muted fw-bold">MESSAGES</small>';
        resultsDiv.appendChild(messagesHeader);
        
        results.messages.forEach(message => {
            const messageItem = createSearchMessageItem(message);
            resultsDiv.appendChild(messageItem);
        });
    }
    
    if (!hasResults) {
        resultsDiv.innerHTML = '<div class="p-3 text-center text-muted">No results found</div>';
    }
    
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(resultsDiv);
}

function createSearchUserItem(user) {
    const item = document.createElement('div');
    item.className = 'p-2 border-bottom search-result-item';
    item.style.cursor = 'pointer';
    
    item.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="me-2">
                <i class="fas fa-user text-muted"></i>
            </div>
            <div>
                <div class="fw-bold">${escapeHtml(user.name)}</div>
                <small class="text-muted">${escapeHtml(user.email)}</small>
            </div>
        </div>
    `;
    
    item.addEventListener('click', () => {
        window.location.href = `/chat/individual/${user.id}`;
    });
    
    item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f8f9fa';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'white';
    });
    
    return item;
}

function createSearchMessageItem(message) {
    const item = document.createElement('div');
    item.className = 'p-2 border-bottom search-result-item';
    item.style.cursor = 'pointer';
    
    item.innerHTML = `
        <div class="d-flex align-items-start">
            <div class="me-2">
                <i class="fas fa-comment text-muted"></i>
            </div>
            <div class="flex-grow-1">
                <div class="d-flex justify-content-between">
                    <small class="text-primary fw-bold">${escapeHtml(message.sender_name)}</small>
                    <small class="text-muted">${escapeHtml(message.created_at)}</small>
                </div>
                <div class="text-truncate">${escapeHtml(message.content)}</div>
            </div>
        </div>
    `;
    
    item.addEventListener('click', () => {
        window.location.href = `/chat/${message.chat_id}`;
    });
    
    item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f8f9fa';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'white';
    });
    
    return item;
}

function hideSearchResults() {
    const existingResults = document.querySelector('.search-results');
    if (existingResults) {
        existingResults.remove();
    }
}

// Mobile responsive features
function initializeMobileFeatures() {
    const chatSidebar = document.querySelector('.chat-sidebar');
    const chatMain = document.querySelector('.chat-main');
    
    if (!chatSidebar || !chatMain) return;
    
    // Add mobile toggle button
    if (window.innerWidth <= 768) {
        addMobileToggleButton();
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            addMobileToggleButton();
        } else {
            removeMobileToggleButton();
            chatSidebar.classList.remove('active');
        }
    });
}

function addMobileToggleButton() {
    const chatHeader = document.querySelector('.chat-header');
    if (!chatHeader || document.querySelector('.mobile-toggle')) return;
    
    const toggleButton = document.createElement('button');
    toggleButton.className = 'btn btn-link text-muted p-2 mobile-toggle';
    toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
    toggleButton.style.marginRight = '1rem';
    
    toggleButton.addEventListener('click', function() {
        const sidebar = document.querySelector('.chat-sidebar');
        sidebar.classList.toggle('active');
    });
    
    chatHeader.querySelector('.d-flex').insertBefore(toggleButton, chatHeader.querySelector('.d-flex').firstChild);
}

function removeMobileToggleButton() {
    const toggleButton = document.querySelector('.mobile-toggle');
    if (toggleButton) {
        toggleButton.remove();
    }
}

// Notification functions
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            icon: '/static/images/logo.png',
            badge: '/static/images/badge.png',
            ...options
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
        
        return notification;
    }
}

// Call simulation functions
function simulateCall(contactName = 'Contact') {
    const callModal = document.getElementById('callModal');
    if (!callModal) return;
    
    document.getElementById('callContactName').textContent = contactName;
    document.getElementById('callStatus').textContent = 'Calling...';
    
    const modal = new bootstrap.Modal(callModal);
    modal.show();
    
    // Play call tone (if audio is available)
    playCallTone();
    
    // Simulate call timeout after 15 seconds
    setTimeout(() => {
        document.getElementById('callStatus').textContent = 'Call ended - No answer';
        stopCallTone();
        setTimeout(() => {
            modal.hide();
        }, 2000);
    }, 15000);
}

function simulateVideoCall(contactName = 'Contact') {
    // Similar to voice call but with video icon
    simulateCall(contactName);
    document.getElementById('callStatus').textContent = 'Video calling...';
}

function answerCall() {
    document.getElementById('callStatus').textContent = 'Connected';
    stopCallTone();
    
    // Simulate conversation for 30 seconds
    setTimeout(() => {
        endCall();
    }, 30000);
}

function endCall() {
    stopCallTone();
    const callModal = bootstrap.Modal.getInstance(document.getElementById('callModal'));
    if (callModal) {
        callModal.hide();
    }
}

// Audio functions
let callToneAudio;

function playCallTone() {
    // Create a simple call tone using Web Audio API
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        
        // Generate a simple ring tone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        oscillator.start();
        
        // Store reference for stopping
        callToneAudio = { oscillator, audioContext };
        
        // Create pulsing effect
        setInterval(() => {
            if (callToneAudio) {
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + 0.1);
            }
        }, 1000);
    }
}

function stopCallTone() {
    if (callToneAudio) {
        callToneAudio.oscillator.stop();
        callToneAudio.audioContext.close();
        callToneAudio = null;
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
}

function formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return formatTime(date);
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric'
        }).format(date);
    }
}

// Export functions for global use
window.simulateCall = simulateCall;
window.simulateVideoCall = simulateVideoCall;
window.answerCall = answerCall;
window.endCall = endCall;
window.showNotification = showNotification;
