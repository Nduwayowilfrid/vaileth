# VailethChat

## Overview

VailethChat is a WhatsApp-inspired messaging application built with Flask. It provides real-time chat functionality with features like direct messaging, group chats, contact management, and user profiles. The application uses a modern web stack with responsive design and includes authentication through Replit's OAuth system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Flask for server-side rendering
- **CSS Framework**: Bootstrap 5 for responsive design and UI components
- **JavaScript**: Vanilla JavaScript with jQuery for dynamic functionality
- **Design System**: WhatsApp-inspired color scheme with CSS custom properties
- **Responsive Design**: Mobile-first approach with sidebar navigation for chat interface

### Backend Architecture
- **Web Framework**: Flask with Blueprint pattern for modular routing
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy extension
- **Authentication**: Flask-Login with Replit OAuth integration via Flask-Dance
- **Session Management**: Flask sessions with proxy fix for HTTPS URL generation
- **Database Models**: User-centric design with relationships for messages, contacts, and groups

### Data Storage Solutions
- **Primary Database**: SQLAlchemy-based with environment-configured DATABASE_URL
- **Connection Pooling**: Configured with pool recycling and pre-ping for reliability
- **Schema Design**: Relational model with foreign key relationships between users, messages, chats, and contacts
- **User Model**: Mandatory Replit Auth compatibility with OAuth token storage

### Authentication and Authorization
- **OAuth Provider**: Replit authentication system
- **User Management**: Flask-Login for session management
- **Token Storage**: Custom UserSessionStorage class for OAuth token persistence
- **Authorization Decorators**: Custom `require_login` decorator for protected routes
- **Session Security**: Permanent sessions with secret key from environment variables

### Core Features
- **Real-time Messaging**: Direct and group messaging with message history
- **Contact Management**: Add/remove contacts with search functionality
- **User Profiles**: Customizable profiles with status messages and profile images
- **Online Status**: Real-time user presence tracking
- **Group Chat**: Multi-user conversations with membership management
- **Search**: Contact and message search capabilities

## External Dependencies

### Core Framework Dependencies
- **Flask**: Web application framework
- **Flask-SQLAlchemy**: Database ORM integration
- **Flask-Login**: User session management
- **Flask-Dance**: OAuth integration framework
- **Werkzeug**: WSGI utilities and proxy fix middleware

### Frontend Dependencies
- **Bootstrap 5**: CSS framework loaded via CDN
- **Font Awesome 6**: Icon library for UI elements
- **jQuery**: JavaScript library for DOM manipulation

### Authentication Services
- **Replit OAuth**: Primary authentication provider
- **JWT**: Token handling for OAuth flows

### Database
- **SQLAlchemy**: ORM with declarative base model
- **Database URL**: Environment-configured database connection (supports various SQL databases)

### Deployment and Configuration
- **Environment Variables**: SESSION_SECRET and DATABASE_URL for configuration
- **Logging**: Python logging module for debugging and monitoring
- **WSGI**: Production-ready with ProxyFix for reverse proxy compatibility