from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Conversation, Message, Listing

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    user_id = int(get_jwt_identity())
    convos = Conversation.query.filter(
        (Conversation.buyer_id == user_id) | (Conversation.seller_id == user_id)
    ).all()

    return jsonify({
        "status": "success",
        "conversations": [{
            "id": c.id,
            "listing": {"id": c.listing.id, "title": c.listing.title},
            "buyer": {"id": c.buyer.id, "name": c.buyer.name},
            "seller": {"id": c.seller.id, "name": c.seller.name},
            "last_message": c.messages[-1].content if c.messages else None,
            "created_at": c.created_at.isoformat()
        } for c in convos]
    }), 200


@chat_bp.route('/conversations', methods=['POST'])
@jwt_required()
def start_conversation():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    listing = Listing.query.get_or_404(data['listing_id'])

    existing = Conversation.query.filter_by(
        listing_id=listing.id,
        buyer_id=user_id,
        seller_id=listing.user_id
    ).first()

    if existing:
        return jsonify({"status": "success", "conversation_id": existing.id}), 200

    convo = Conversation(
        listing_id=listing.id,
        buyer_id=user_id,
        seller_id=listing.user_id
    )
    db.session.add(convo)
    db.session.commit()

    return jsonify({"status": "success", "conversation_id": convo.id}), 201


@chat_bp.route('/conversations/<int:convo_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(convo_id):
    messages = Message.query.filter_by(conversation_id=convo_id).order_by(Message.sent_at).all()

    return jsonify({
        "status": "success",
        "messages": [{
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_name": m.sender.name,
            "content": m.content,
            "is_read": m.is_read,
            "sent_at": m.sent_at.isoformat()
        } for m in messages]
    }), 200


@chat_bp.route('/conversations/<int:convo_id>/messages', methods=['POST'])
@jwt_required()
def send_message(convo_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()

    msg = Message(
        conversation_id=convo_id,
        sender_id=user_id,
        content=data['content']
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify({"status": "success", "message": "Message sent"}), 201