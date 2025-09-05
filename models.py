from datetime import datetime

from app import db
from flask_dance.consumer.storage.sqla import OAuthConsumerMixin
from flask_login import UserMixin
from sqlalchemy import UniqueConstraint

# (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=True)
    first_name = db.Column(db.String, nullable=True)
    last_name = db.Column(db.String, nullable=True)
    profile_image_url = db.Column(db.String, nullable=True)
    status_message = db.Column(db.String, default="Hey there! I am using VailethChat.")
    phone_number = db.Column(db.String, nullable=True)
    last_seen = db.Column(db.DateTime, default=datetime.now)
    is_online = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy='dynamic')
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver', lazy='dynamic')
    group_memberships = db.relationship('GroupMember', backref='user', lazy='dynamic')
    contacts_added = db.relationship('Contact', foreign_keys='Contact.user_id', backref='user', lazy='dynamic')

    @property
    def display_name(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.email:
            return self.email.split('@')[0]
        return f"User {self.id}"

# (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
class OAuth(OAuthConsumerMixin, db.Model):
    user_id = db.Column(db.String, db.ForeignKey(User.id))
    browser_session_key = db.Column(db.String, nullable=False)
    user = db.relationship(User)

    __table_args__ = (UniqueConstraint(
        'user_id',
        'browser_session_key',
        'provider',
        name='uq_user_browser_session_key_provider',
    ),)

class Contact(db.Model):
    __tablename__ = 'contacts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    contact_user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    contact_name = db.Column(db.String, nullable=True)  # Custom name for the contact
    created_at = db.Column(db.DateTime, default=datetime.now)

    contact_user = db.relationship('User', foreign_keys=[contact_user_id])

    __table_args__ = (UniqueConstraint('user_id', 'contact_user_id', name='unique_contact'),)

class Chat(db.Model):
    __tablename__ = 'chats'
    id = db.Column(db.Integer, primary_key=True)
    chat_type = db.Column(db.String, nullable=False)  # 'individual' or 'group'
    name = db.Column(db.String, nullable=True)  # For group chats
    description = db.Column(db.String, nullable=True)
    created_by = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    messages = db.relationship('Message', backref='chat', lazy='dynamic', order_by='Message.created_at')
    members = db.relationship('GroupMember', backref='chat', lazy='dynamic')
    creator = db.relationship('User', foreign_keys=[created_by])

class GroupMember(db.Model):
    __tablename__ = 'group_members'
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chats.id'), nullable=False)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String, default='member')  # 'admin' or 'member'
    joined_at = db.Column(db.DateTime, default=datetime.now)
    left_at = db.Column(db.DateTime, nullable=True)

    __table_args__ = (UniqueConstraint('chat_id', 'user_id', name='unique_group_member'),)

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chats.id'), nullable=False)
    sender_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=True)  # For individual chats
    message_type = db.Column(db.String, default='text')  # 'text', 'image', 'file', 'emoji'
    content = db.Column(db.Text, nullable=False)
    file_url = db.Column(db.String, nullable=True)  # For image/file messages
    reply_to_id = db.Column(db.Integer, db.ForeignKey('messages.id'), nullable=True)
    
    # Message status
    is_delivered = db.Column(db.Boolean, default=False)
    is_read = db.Column(db.Boolean, default=False)
    delivered_at = db.Column(db.DateTime, nullable=True)
    read_at = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    # Self-referential relationship for replies
    reply_to = db.relationship('Message', remote_side=[id], backref='replies')

class Status(db.Model):
    __tablename__ = 'status_updates'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String, nullable=True)
    background_color = db.Column(db.String, default='#25D366')
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    user = db.relationship('User', backref='status_updates')

    @property
    def is_expired(self):
        return datetime.now() > self.expires_at
