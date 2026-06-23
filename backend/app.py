from flask import Flask, jsonify, request
from flask_cors import CORS
from extensions import db
import models

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost:3306/adnu_marketplace'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db.init_app(app)

# Test Route
@app.route('/test', methods=['GET'])
def home():
    return jsonify({"Status": "Success", "message": 'Connected to One Big Hub!'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)