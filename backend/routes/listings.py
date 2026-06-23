from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Listing

listings_bp = Blueprint('listings', __name__)


@listings_bp.route('/', methods=['GET'])
def get_listings():
    transaction_type = request.args.get('type')
    category = request.args.get('category')

    query = Listing.query.filter_by(status='Available')

    if transaction_type:
        query = query.filter_by(transaction_type=transaction_type)
    if category:
        query = query.filter_by(category=category)

    listings = query.order_by(Listing.created_at.desc()).all()

    return jsonify({
        "status": "success",
        "listings": [{
            "id": l.id,
            "title": l.title,
            "category": l.category,
            "description": l.description,
            "transaction_type": l.transaction_type,
            "price": float(l.price) if l.price else None,
            "rent_duration": l.rent_duration,
            "trade_for": l.trade_for,
            "meetup_location": l.meetup_location,
            "condition": l.condition,
            "status": l.status,
            "image_url": l.photos[0].photo_url if l.photos else None,
            "seller": {"id": l.owner.id, "name": l.owner.name},
            "created_at": l.created_at.isoformat()
        } for l in listings]
    }), 200


@listings_bp.route('/<int:listing_id>', methods=['GET'])
def get_listing(listing_id):
    l = Listing.query.get_or_404(listing_id)

    return jsonify({
        "status": "success",
        "listing": {
            "id": l.id,
            "title": l.title,
            "category": l.category,
            "description": l.description,
            "transaction_type": l.transaction_type,
            "price": float(l.price) if l.price else None,
            "rent_duration": l.rent_duration,
            "trade_for": l.trade_for,
            "meetup_location": l.meetup_location,
            "condition": l.condition,
            "status": l.status,
            "photos": [p.photo_url for p in l.photos],
            "seller": {
                "id": l.owner.id,
                "name": l.owner.name,
                "department": l.owner.department,
                "rating": float(l.owner.rating) if l.owner.rating else 0.0
            },
            "created_at": l.created_at.isoformat()
        }
    }), 200


@listings_bp.route('/', methods=['POST'])
@jwt_required()
def create_listing():
    data = request.get_json()
    user_id = get_jwt_identity()

    if not data.get('title') or not data.get('category') or not data.get('transaction_type'):
        return jsonify({"status": "error", "message": "Title, category, and transaction type are required"}), 400

    new_listing = Listing(
        title=data['title'],
        category=data['category'],
        description=data.get('description'),
        transaction_type=data['transaction_type'],
        price=data.get('price'),
        rent_duration=data.get('rent_duration'),
        trade_for=data.get('trade_for'),
        meetup_location=data.get('meetup_location'),
        condition=data.get('condition'),
        user_id=user_id
    )
    db.session.add(new_listing)
    db.session.commit()

    return jsonify({"status": "success", "message": "Listing created", "id": new_listing.id}), 201


@listings_bp.route('/<int:listing_id>', methods=['PUT'])
@jwt_required()
def update_listing(listing_id):
    user_id = get_jwt_identity()
    l = Listing.query.get_or_404(listing_id)

    if str(l.user_id) != str(user_id):
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    data = request.get_json()
    l.title = data.get('title', l.title)
    l.category = data.get('category', l.category)
    l.description = data.get('description', l.description)
    l.price = data.get('price', l.price)
    l.status = data.get('status', l.status)
    l.meetup_location = data.get('meetup_location', l.meetup_location)
    l.condition = data.get('condition', l.condition)

    db.session.commit()
    return jsonify({"status": "success", "message": "Listing updated"}), 200


@listings_bp.route('/<int:listing_id>', methods=['DELETE'])
@jwt_required()
def delete_listing(listing_id):
    user_id = get_jwt_identity()
    l = Listing.query.get_or_404(listing_id)

    if str(l.user_id) != str(user_id):
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    db.session.delete(l)
    db.session.commit()
    return jsonify({"status": "success", "message": "Listing deleted"}), 200