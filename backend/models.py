from extensions import db
from datetime import datetime

# Tables
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    google_id = db.Column(db.String(255), unique=True, nullable=False) 
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    department = db.Column(db.String(100), nullable=True)

    # Time Related Fields
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    listings = db.relationship('Listing', backref='owner', lazy=True, cascade="all, delete-orphan") 

class Listing(db.Model):
    __tablename__ = 'listings'

    # Stadard Listing Fields
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False) 
    description = db.Column(db.Text, nullable=True)
    transaction_type = db.Column(db.String(50), nullable=False) # "Buy", "Sell", "Rent", "Trade"
    

    # Additional Fields
    price = db.Column(db.Numeric(10, 2), nullable=True)
    rent_duration = db.Column(db.String(50), nullable=True)
    trade_for = db.Column(db.String(255), nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Available')

    # Time Related Fields
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Foreign Key
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False) 