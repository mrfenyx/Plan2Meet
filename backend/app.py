from flask import Flask
from flask_cors import CORS
from flask import send_from_directory
import os
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

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    static_folder = os.path.join(os.path.dirname(__file__), "frontend_dist")
    if path != "" and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)
    else:
        return send_from_directory(static_folder, "index.html")