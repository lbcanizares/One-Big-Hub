from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({"status": "error", "message": "Name, email, and password are required"}), 400

    if not data['email'].endswith('@gbox.adnu.edu.ph'):
        return jsonify({"status": "error", "message": "Only @gbox.adnu.edu.ph emails are allowed"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"status": "error", "message": "Email already registered"}), 409

    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        department=data.get('department')
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"status": "success", "message": "Account created successfully"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({"status": "error", "message": "Email and password are required"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "status": "success",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "department": user.department,
            "profile_photo": user.profile_photo,
            "rating": float(user.rating) if user.rating else 0.0
        }
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    return jsonify({
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "department": user.department,
            "profile_photo": user.profile_photo,
            "rating": float(user.rating) if user.rating else 0.0
        }
    }), 200

@auth_bp.route('/profile/photo', methods=['POST'])
@jwt_required()
def update_profile_photo():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if 'photo' not in request.files:
        return jsonify({"status": "error", "message": "No photo"}), 400

    file = request.files['photo']
    from werkzeug.utils import secure_filename
    import os
    filename = secure_filename(f"profile_{user_id}_{file.filename}")
    os.makedirs('uploads', exist_ok=True)
    file.save(os.path.join('uploads', filename))
    user.profile_photo = f'http://127.0.0.1:5000/uploads/{filename}'
    db.session.commit()

    return jsonify({
        "status": "success",
        "profile_photo": user.profile_photo
    }), 200

@auth_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "department": user.department,
            "profile_photo": user.profile_photo,
            "rating": float(user.rating) if user.rating else 0.0,
            "contact_number": user.contact_number
        }
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if 'email' in data and data['email'] != user.email:
        if not data['email'].endswith('@gbox.adnu.edu.ph'):
            return jsonify({"status": "error", "message": "Only @gbox.adnu.edu.ph emails are allowed"}), 400
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"status": "error", "message": "Email already in use"}), 409

    user.name = data.get('name', user.name)
    user.department = data.get('department', user.department)
    user.email = data.get('email', user.email)
    user.contact_number = data.get('contact_number', user.contact_number)

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "department": user.department,
            "profile_photo": user.profile_photo,
            "contact_number": user.contact_number,
            "rating": float(user.rating) if user.rating else 0.0
        }
    }), 200