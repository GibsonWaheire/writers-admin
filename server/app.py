from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from db import db

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///writers_admin.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Enable CORS for all routes with proper preflight handling
CORS(app, 
     resources={r"/api/*": {
         "origins": "*",
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"]
     }},
     supports_credentials=True)

# Initialize db with app
db.init_app(app)

# Import models (they import db from db.py)
from models import *

# Import routes
from routes import auth, users, writers, orders, pod_orders, reviews, financial, notifications, messages, misc

# Register blueprints
app.register_blueprint(auth.bp)
app.register_blueprint(users.bp)
app.register_blueprint(writers.bp)
app.register_blueprint(orders.bp)
app.register_blueprint(pod_orders.bp)
app.register_blueprint(reviews.bp)
app.register_blueprint(financial.bp)
app.register_blueprint(notifications.bp)
app.register_blueprint(messages.bp)
app.register_blueprint(misc.bp)

@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': 'Writers Admin API is running'}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001)

