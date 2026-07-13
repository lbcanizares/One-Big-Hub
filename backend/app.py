from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from extensions import db
from datetime import timedelta
from flask import send_from_directory
import os
import models

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mysql+pymysql://{os.environ.get('MYSQL_USER', 'root')}:"
    f"{os.environ.get('MYSQL_PASSWORD', 'root')}@"
    f"{os.environ.get('MYSQL_HOST', 'localhost')}:"
    f"{os.environ.get('MYSQL_PORT', '3306')}/"
    f"{os.environ.get('MYSQL_DATABASE', 'adnu_marketplace')}" 
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'onebighub-secret-key-2026'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)


db.init_app(app)
jwt = JWTManager(app)

CORS(app, 
     resources={r"/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=False
)

from routes.auth import auth_bp
from routes.listings import listings_bp
from routes.chat import chat_bp
from routes.offers import offers_bp
from routes.reviews import reviews_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(listings_bp, url_prefix='/api/listings')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(offers_bp, url_prefix='/api/offers')
app.register_blueprint(reviews_bp, url_prefix='/api/reviews') 



@app.route('/test', methods=['GET'])
def test():
    return jsonify({"status": "success", "message": "Connected to One Big Hub!"}), 200
@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(os.path.join(app.root_path, 'uploads'), filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("All tables created!")
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

