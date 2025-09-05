from datetime import datetime, timedelta
from flask import session, render_template, request, redirect, url_for, jsonify, flash
from flask_login import current_user
from sqlalchemy import or_, and_

from app import app, db
from replit_auth import require_login, make_replit_blueprint
from models import User, Contact, Chat, Message, GroupMember, Status

app.register_blueprint(make_replit_blueprint(), url_prefix="/auth")

# Make session permanent
@app.before_request
def make_session_permanent():
    session.permanent = True

@app.route('/')
def index():
    """Landing page for logged out users, chat interface for logged in users"""
    if current_user.is_authenticated:
        # Update user online status
        current_user.is_online = True
        current_user.last_seen = datetime.now()
        db.session.commit()
        
        # Get user's contacts and recent chats
        contacts = get_user_contacts(current_user.id)
        recent_chats = get_recent_chats(current_user.id)
        
        return render_template('chat.html', 
                             user=current_user, 
                             contacts=contacts,
                             recent_chats=recent_chats)
    else:
        return render_template('landing.html')

@app.route('/chat/<int:chat_id>')
@require_login
def view_chat(chat_id):
    """View specific chat"""
    chat = Chat.query.get_or_404(chat_id)
    
    # Check if user is member of this chat
    if not is_user_chat_member(current_user.id, chat_id):
        flash('You are not a member of this chat.', 'error')
        return redirect(url_for('index'))
    
    # Get chat messages
    messages = Message.query.filter_by(chat_id=chat_id).order_by(Message.created_at).all()
    
    # Mark messages as read
    unread_messages = Message.query.filter_by(
        chat_id=chat_id,
        receiver_id=current_user.id,
        is_read=False
    ).all()
    
    for msg in unread_messages:
        msg.is_read = True
        msg.read_at = datetime.now()
    
    db.session.commit()
    
    # Get contacts and recent chats for sidebar
    contacts = get_user_contacts(current_user.id)
    recent_chats = get_recent_chats(current_user.id)
    
    return render_template('chat.html',
                         user=current_user,
                         current_chat=chat,
                         messages=messages,
                         contacts=contacts,
                         recent_chats=recent_chats)

@app.route('/chat/individual/<user_id>')
@require_login
def start_individual_chat(user_id):
    """Start or continue individual chat with a user"""
    other_user = User.query.get_or_404(user_id)
    
    # Find existing individual chat between these users
    existing_chat = Chat.query.filter_by(chat_type='individual').join(
        GroupMember, Chat.id == GroupMember.chat_id
    ).filter(
        GroupMember.user_id.in_([current_user.id, user_id])
    ).group_by(Chat.id).having(
        db.func.count(GroupMember.user_id) == 2
    ).first()
    
    if existing_chat:
        return redirect(url_for('view_chat', chat_id=existing_chat.id))
    
    # Create new individual chat
    new_chat = Chat(
        chat_type='individual',
        created_by=current_user.id
    )
    db.session.add(new_chat)
    db.session.flush()
    
    # Add both users as members
    member1 = GroupMember(chat_id=new_chat.id, user_id=current_user.id)
    member2 = GroupMember(chat_id=new_chat.id, user_id=user_id)
    
    db.session.add(member1)
    db.session.add(member2)
    db.session.commit()
    
    return redirect(url_for('view_chat', chat_id=new_chat.id))

@app.route('/send_message', methods=['POST'])
@require_login
def send_message():
    """Send a message in a chat"""
    chat_id = request.form.get('chat_id')
    content = request.form.get('content', '').strip()
    message_type = request.form.get('message_type', 'text')
    
    if not content:
        return jsonify({'error': 'Message content is required'}), 400
    
    chat = Chat.query.get_or_404(chat_id)
    
    # Check if user is member of this chat
    if not is_user_chat_member(current_user.id, chat_id):
        return jsonify({'error': 'You are not a member of this chat'}), 403
    
    # Determine receiver for individual chats
    receiver_id = None
    if chat.chat_type == 'individual':
        other_member = GroupMember.query.filter(
            GroupMember.chat_id == chat_id,
            GroupMember.user_id != current_user.id
        ).first()
        if other_member:
            receiver_id = other_member.user_id
    
    # Create message
    message = Message(
        chat_id=chat_id,
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=content,
        message_type=message_type,
        is_delivered=True,
        delivered_at=datetime.now()
    )
    
    db.session.add(message)
    
    # Update chat timestamp
    chat.updated_at = datetime.now()
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': {
            'id': message.id,
            'content': message.content,
            'sender_name': current_user.display_name,
            'created_at': message.created_at.strftime('%H:%M'),
            'is_delivered': message.is_delivered
        }
    })

@app.route('/contacts')
@require_login
def contacts():
    """View and manage contacts"""
    user_contacts = get_user_contacts(current_user.id)
    all_users = User.query.filter(User.id != current_user.id).all()
    
    # Filter out users who are already contacts
    contact_user_ids = [contact.contact_user_id for contact in user_contacts]
    available_users = [user for user in all_users if user.id not in contact_user_ids]
    
    return render_template('contacts.html',
                         user=current_user,
                         contacts=user_contacts,
                         available_users=available_users)

@app.route('/add_contact/<user_id>')
@require_login
def add_contact(user_id):
    """Add a user to contacts"""
    if user_id == current_user.id:
        flash('You cannot add yourself as a contact.', 'error')
        return redirect(url_for('contacts'))
    
    # Check if contact already exists
    existing_contact = Contact.query.filter_by(
        user_id=current_user.id,
        contact_user_id=user_id
    ).first()
    
    if existing_contact:
        flash('User is already in your contacts.', 'info')
        return redirect(url_for('contacts'))
    
    # Add contact
    contact = Contact(
        user_id=current_user.id,
        contact_user_id=user_id
    )
    db.session.add(contact)
    db.session.commit()
    
    flash('Contact added successfully!', 'success')
    return redirect(url_for('contacts'))

@app.route('/profile')
@require_login
def profile():
    """View and edit user profile"""
    return render_template('profile.html', user=current_user)

@app.route('/update_profile', methods=['POST'])
@require_login
def update_profile():
    """Update user profile"""
    first_name = request.form.get('first_name', '').strip()
    last_name = request.form.get('last_name', '').strip()
    status_message = request.form.get('status_message', '').strip()
    phone_number = request.form.get('phone_number', '').strip()
    
    current_user.first_name = first_name
    current_user.last_name = last_name
    current_user.status_message = status_message or "Hey there! I am using VailethChat."
    current_user.phone_number = phone_number
    current_user.updated_at = datetime.now()
    
    db.session.commit()
    flash('Profile updated successfully!', 'success')
    return redirect(url_for('profile'))

@app.route('/create_group', methods=['GET', 'POST'])
@require_login
def create_group():
    """Create a new group chat"""
    if request.method == 'POST':
        group_name = request.form.get('group_name', '').strip()
        description = request.form.get('description', '').strip()
        member_ids = request.form.getlist('members')
        
        if not group_name:
            flash('Group name is required.', 'error')
            return redirect(url_for('create_group'))
        
        # Create group chat
        group_chat = Chat(
            chat_type='group',
            name=group_name,
            description=description,
            created_by=current_user.id
        )
        db.session.add(group_chat)
        db.session.flush()
        
        # Add creator as admin
        admin_member = GroupMember(
            chat_id=group_chat.id,
            user_id=current_user.id,
            role='admin'
        )
        db.session.add(admin_member)
        
        # Add selected members
        for member_id in member_ids:
            if member_id != current_user.id:
                member = GroupMember(
                    chat_id=group_chat.id,
                    user_id=member_id,
                    role='member'
                )
                db.session.add(member)
        
        db.session.commit()
        flash('Group created successfully!', 'success')
        return redirect(url_for('view_chat', chat_id=group_chat.id))
    
    # GET request - show create group form
    contacts = get_user_contacts(current_user.id)
    return render_template('create_group.html', user=current_user, contacts=contacts)

@app.route('/search')
@require_login
def search():
    """Search for users and messages"""
    query = request.args.get('q', '').strip()
    
    if not query:
        return jsonify({'users': [], 'messages': []})
    
    # Search users
    users = User.query.filter(
        or_(
            User.first_name.ilike(f'%{query}%'),
            User.last_name.ilike(f'%{query}%'),
            User.email.ilike(f'%{query}%')
        ),
        User.id != current_user.id
    ).limit(10).all()
    
    # Search messages in user's chats
    user_chat_ids = db.session.query(GroupMember.chat_id).filter_by(user_id=current_user.id).subquery()
    messages = Message.query.filter(
        Message.chat_id.in_(user_chat_ids),
        Message.content.ilike(f'%{query}%')
    ).order_by(Message.created_at.desc()).limit(20).all()
    
    return jsonify({
        'users': [{'id': user.id, 'name': user.display_name, 'email': user.email} for user in users],
        'messages': [{
            'id': msg.id,
            'content': msg.content,
            'chat_id': msg.chat_id,
            'sender_name': msg.sender.display_name,
            'created_at': msg.created_at.strftime('%Y-%m-%d %H:%M')
        } for msg in messages]
    })

# Helper functions
def get_user_contacts(user_id):
    """Get all contacts for a user"""
    return Contact.query.filter_by(user_id=user_id).join(
        User, Contact.contact_user_id == User.id
    ).add_columns(
        User.id, User.first_name, User.last_name, User.email, 
        User.profile_image_url, User.status_message, User.is_online, User.last_seen
    ).all()

def get_recent_chats(user_id):
    """Get recent chats for a user"""
    return Chat.query.join(
        GroupMember, Chat.id == GroupMember.chat_id
    ).filter(
        GroupMember.user_id == user_id,
        GroupMember.left_at.is_(None)
    ).order_by(Chat.updated_at.desc()).limit(20).all()

def is_user_chat_member(user_id, chat_id):
    """Check if user is a member of the chat"""
    member = GroupMember.query.filter_by(
        user_id=user_id,
        chat_id=chat_id,
        left_at=None
    ).first()
    return member is not None

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500
