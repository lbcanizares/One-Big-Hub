from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Offer, Listing

offers_bp = Blueprint('offers', __name__)


@offers_bp.route('/', methods=['POST'])
@jwt_required()
def make_offer():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    listing = Listing.query.get_or_404(data['listing_id'])

    offer = Offer(
        listing_id=listing.id,
        buyer_id=user_id,
        offer_price=data.get('offer_price'),
        message=data.get('message')
    )
    db.session.add(offer)
    db.session.commit()

    return jsonify({"status": "success", "message": "Offer sent"}), 201


@offers_bp.route('/<int:offer_id>/respond', methods=['PUT'])
@jwt_required()
def respond_offer(offer_id):
    user_id = int(get_jwt_identity())
    offer = Offer.query.get_or_404(offer_id)
    listing = Listing.query.get(offer.listing_id)

    if str(listing.user_id) != str(user_id):
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    data = request.get_json()
    offer.status = data.get('status', offer.status)
    db.session.commit()

    return jsonify({"status": "success", "message": f"Offer {offer.status}"}), 200