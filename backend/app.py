from flask import Flask
from flask_cors import CORS
from db import init_mongo
from routes.event_routes import event_bp

app = Flask(__name__)
CORS(app)
init_mongo(app)

app.register_blueprint(event_bp)

@app.route('/api/hello')
def hello():
    return {"message": "Hello from Plan2Meet backend!"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
