from flask import Blueprint, request, jsonify
from db import mongo
from models.event_model import create_event_document, serialize_event
from datetime import datetime
from bson.objectid import ObjectId

event_bp = Blueprint('event', __name__, url_prefix='/api/event')

@event_bp.route('', methods=['POST'])
def create_event():
    data = request.json
    title = data.get('title', 'Untitled Event')
    description = data.get('description', '')
    date_range = data['date_range']
    time_range = data['time_range']
    time_step = data.get('time_step_minutes', 30)
    settings = data.get('settings', {"hide_others_until_submit": False})

    event = create_event_document(
        title, description, date_range, time_range, time_step, settings
    )
    result = mongo.db.events.insert_one(event)
    event["_id"] = result.inserted_id
    return jsonify(serialize_event(event)), 201

@event_bp.route('/<event_id>', methods=['GET'])
def get_event(event_id):
    event = mongo.db.events.find_one({'_id': ObjectId(event_id)})
    if not event:
        return jsonify(error="Not found"), 404
    return jsonify(serialize_event(event))
