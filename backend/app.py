from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Read the Mongo URI from environment variable (set in docker-compose)
app.config["MONGO_URI"] = os.environ.get("MONGO_URI", "mongodb://localhost:27017/plan2meet")
mongo = PyMongo(app)

@app.route('/api/hello')
def hello():
    return jsonify(message="Hello from Plan2Meet backend!")

# Simple test: store and retrieve a meeting
@app.route('/api/meeting', methods=['POST'])
def create_meeting():
    data = request.json
    # Example: {"title": "My meeting"}
    result = mongo.db.meetings.insert_one({'title': data['title']})
    return jsonify(id=str(result.inserted_id), title=data['title'])

@app.route('/api/meeting/<meeting_id>', methods=['GET'])
def get_meeting(meeting_id):
    from bson.objectid import ObjectId
    meeting = mongo.db.meetings.find_one({'_id': ObjectId(meeting_id)})
    if not meeting:
        return jsonify(error="Not found"), 404
    return jsonify(id=str(meeting['_id']), title=meeting['title'])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
