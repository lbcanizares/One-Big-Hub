from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Offer, Listing, Conversation, Message

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
    db.session.flush()

    convo = Conversation.query.filter_by(
        listing_id=listing.id, buyer_id=user_id, seller_id=listing.user_id
    ).first()
    if not convo:
        convo = Conversation(listing_id=listing.id, buyer_id=user_id, seller_id=listing.user_id)
        db.session.add(convo)
        db.session.flush()

    msg = Message(
        conversation_id=convo.id,
        sender_id=user_id,
        content=data.get('message') or 'Sent an offer',
        message_type='offer',
        offer_id=offer.id
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify({"status": "success", "message": "Offer sent", "conversation_id": convo.id}), 201


@offers_bp.route('/<int:offer_id>/respond', methods=['PUT'])
@jwt_required()
def respond_offer(offer_id):
    user_id = int(get_jwt_identity())
    offer = Offer.query.get_or_404(offer_id)
    listing = Listing.query.get(offer.listing_id)

    if str(listing.user_id) != str(user_id):
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    data = request.get_json()
    offer.status = data.get('status', offer.status)  # 'accepted' or 'declined'
    db.session.commit()

    convo = Conversation.query.filter_by(
        listing_id=listing.id, buyer_id=offer.buyer_id, seller_id=listing.user_id
    ).first()
    if convo:
        system_msg = Message(
            conversation_id=convo.id,
            sender_id=user_id,
            content=f"Offer {offer.status}",
            message_type='system'
        )
        db.session.add(system_msg)
        if offer.status == 'accepted':
            listing.status = 'Sold'
        db.session.commit()

    return jsonify({"status": "success", "message": f"Offer {offer.status}"}), 200