# VailethChat

A WhatsApp-inspired messaging application built with Flask and Bootstrap. VailethChat provides real-time chat functionality with modern web technologies.

## Features

- 🔐 **User Authentication** - Secure login with Replit OAuth
- 💬 **Real-time Messaging** - Instant messaging with AJAX updates
- 👥 **Group Chats** - Create and manage group conversations
- 📱 **Individual Chats** - Direct messaging between users
- 📞 **Call Simulation** - Voice and video call interface
- 👤 **User Profiles** - Customizable profiles with status messages
- 📋 **Contact Management** - Add and organize contacts
- 🔍 **Search** - Find users and messages quickly
- 📱 **Responsive Design** - Mobile-first WhatsApp-inspired UI
- ✅ **Message Status** - Delivery and read indicators
- ⚡ **Fast & Lightweight** - Optimized for performance

## Tech Stack

- **Backend**: Flask (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Frontend**: Bootstrap 5, jQuery, Vanilla JavaScript
- **Authentication**: Replit OAuth with Flask-Login
- **Styling**: Custom CSS with WhatsApp-inspired design

## Installation

### Prerequisites
- Python 3.11+
- PostgreSQL database
- Replit account (for authentication)

### Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd vailethchat
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   export DATABASE_URL="your_postgresql_url"
   export SESSION_SECRET="your_secret_key"
   export REPL_ID="your_replit_app_id"
   ```

4. Initialize the database:
   ```bash
   python -c "from app import app, db; app.app_context().push(); db.create_all()"
   ```

5. Run the application:
   ```bash
   python main.py
   ```

The application will be available at `http://localhost:5000`

## Project Structure

```
vailethchat/
├── app.py              # Flask application setup
├── main.py             # Application entry point
├── models.py           # Database models
├── routes.py           # Application routes
├── replit_auth.py      # Authentication logic
├── static/
│   ├── css/
│   │   └── style.css   # Custom styles
│   └── js/
│       ├── main.js     # Main JavaScript functions
│       └── chat.js     # Chat-specific functions
├── templates/
│   ├── base.html       # Base template
│   ├── landing.html    # Landing page
│   ├── chat.html       # Chat interface
│   ├── contacts.html   # Contacts management
│   ├── profile.html    # User profile
│   ├── 403.html        # Error page
│   └── 500.html        # Server error page
└── requirements.txt    # Python dependencies
```

## Database Models

- **User**: User profiles and authentication
- **Contact**: User contact relationships
- **Chat**: Individual and group chat containers
- **GroupMember**: Group chat membership
- **Message**: Chat messages with status tracking
- **Status**: User status updates (24h stories)

## Features Overview

### Authentication
- Secure OAuth integration with Replit
- Session management with Flask-Login
- User profile management

### Messaging
- Real-time message sending with AJAX
- Message delivery and read status
- Group and individual chat support
- Message search functionality

### User Interface
- WhatsApp-inspired design
- Responsive mobile-first layout
- Dark/light theme support
- Smooth animations and transitions

### Additional Features
- Contact management system
- User online status tracking
- Call simulation (voice/video)
- Emoji picker integration
- File attachment support (planned)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you have any questions or need help, please open an issue on GitLab.

## Deployment

The application is designed to work on Replit out of the box. For other deployments:

1. Ensure PostgreSQL is available
2. Set the required environment variables
3. Run database migrations
4. Start the Flask application

---

Built with ❤️ using Flask and Bootstrap