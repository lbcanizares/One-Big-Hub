from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from extensions import db
import models

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost:3306/adnu_marketplace'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'onebighub-secret-key-2026'

db.init_app(app)
jwt = JWTManager(app)

from routes.auth import auth_bp
from routes.listings import listings_bp
from routes.chat import chat_bp
from routes.offers import offers_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(listings_bp, url_prefix='/api/listings')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(offers_bp, url_prefix='/api/offers')

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"status": "success", "message": "Connected to One Big Hub!"}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("All tables created!")
    app.run(debug=True, port=5000)