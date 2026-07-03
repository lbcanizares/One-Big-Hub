from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Review, Offer, User, Listing

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route('/', methods=['POST'])
@jwt_required()
def create_review():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    listing_id = data.get('listing_id')
    reviewed_user_id = data.get('reviewed_user_id')

    if not listing_id or not reviewed_user_id:
        return jsonify({"status": "error", "message": "Missing listing_id or reviewed_user_id"}), 400

    reviewed_user_id = int(reviewed_user_id)

    listing = Listing.query.get(listing_id)
    if not listing:
        return jsonify({"status": "error", "message": "Listing not found"}), 404

    accepted_offer = Offer.query.filter_by(listing_id=listing_id, status='accepted').first()
    if not accepted_offer:
        return jsonify({"status": "error", "message": "No accepted offer found for this transaction"}), 403

    seller_id = listing.user_id
    buyer_id = accepted_offer.buyer_id

    valid_pair = (
        (user_id == buyer_id and reviewed_user_id == seller_id) or
        (user_id == seller_id and reviewed_user_id == buyer_id)
    )
    if not valid_pair:
        return jsonify({"status": "error", "message": "You are not part of this transaction"}), 403

    existing = Review.query.filter_by(
        reviewer_id=user_id, reviewed_user_id=reviewed_user_id, listing_id=listing_id
    ).first()
    if existing:
        return jsonify({"status": "error", "message": "You already reviewed this transaction"}), 409

    review = Review(
        reviewer_id=user_id,
        reviewed_user_id=reviewed_user_id,
        listing_id=listing_id,
        rating=data.get('rating'),
        comment=data.get('comment')
    )
    db.session.add(review)
    db.session.commit()

    reviewed_user = User.query.get(reviewed_user_id)
    all_reviews = Review.query.filter_by(reviewed_user_id=reviewed_user_id).all()
    ratings = [r.rating for r in all_reviews if r.rating is not None]
    if ratings:
        reviewed_user.rating = round(sum(ratings) / len(ratings), 2)
    db.session.commit()

    return jsonify({"status": "success", "message": "Review submitted"}), 201


@reviews_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_reviews(user_id):
    reviews = Review.query.filter_by(reviewed_user_id=user_id).order_by(Review.created_at.desc()).all()
    return jsonify({
        "status": "success",
        "reviews": [{
            "id": r.id,
            "reviewer_id": r.reviewer_id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat()
        } for r in reviews]
    }), 200