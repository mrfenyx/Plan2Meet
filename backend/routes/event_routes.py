from flask import Blueprint, request, jsonify
from db import mongo
from models.event_model import create_event_document, serialize_event
from datetime import datetime
from bson.objectid import ObjectId

event_bp = Blueprint('event', __name__, url_prefix='/api/event')

@event_bp.route('', methods=['POST'])
def create_event():
    data = request.json
    if data is None:
        return jsonify({"error": "Invalid or missing JSON in request"}), 400
    title = data.get('title', 'Untitled Event')
    description = data.get('description', '')
    date_range = data['date_range']
    time_range = data['time_range']
    time_step = data.get('time_step_minutes', 30)
    settings = data.get('settings', {"hide_others_until_submit": False})

    event = create_event_document(
        title, description, date_range, time_range, time_step, settings
    )
    if mongo.db is None:
        raise RuntimeError("MongoDB not initialized!")
    result = mongo.db.events.insert_one(event)
    event["_id"] = result.inserted_id
    return jsonify(serialize_event(event)), 201

@event_bp.route('/<event_id>', methods=['GET'])
def get_event(event_id):
    if mongo.db is None:
        raise RuntimeError("MongoDB not initialized!")
    event = mongo.db.events.find_one({'_id': ObjectId(event_id)})
    if not event:
        return jsonify(error="Not found"), 404
    return jsonify(serialize_event(event))

@event_bp.route('/<event_id>/participant', methods=['POST'])
def get_or_create_participant(event_id):
    data = request.get_json()
    name = data.get('name', '').strip()
    password = data.get('password', '')

    if not name:
        return jsonify({"error": "Name is required"}), 400

    if mongo.db is None:
        raise RuntimeError("MongoDB not initialized!")
    event = mongo.db.events.find_one({'_id': ObjectId(event_id)})
    if not event:
        return jsonify({"error": "Event not found"}), 404

    participant = None
    for p in event.get('participants', []):
        if p['name'].strip().lower() == name.lower():
            participant = p
            break

    if participant:
        # If a password was set, check it matches
        participant_pw = participant.get('password', '')
        if participant_pw and password != participant_pw:
            return jsonify({"error": "Incorrect password"}), 403
        # Return participant data (do not include password)
        return jsonify({
            "name": participant["name"],
            "availability": participant.get("availability", {})
        }), 200

    # Not found: return 404 (frontend will treat as new participant)
    return jsonify({"error": "Not found"}), 404

@event_bp.route('/<event_id>/availability', methods=['POST'])
def save_availability(event_id):
    data = request.get_json()
    name = data.get("name", "").strip()
    password = data.get("password", "")
    slots = data.get("slots", [])

    if not name or not isinstance(slots, list):
        return jsonify({"error": "Missing name or slots"}), 400

    if mongo.db is None:
        raise RuntimeError("MongoDB not initialized!")
    event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        return jsonify({"error": "Event not found"}), 404

    participants = event.get("participants", [])
    participant = None
    for p in participants:
        if p["name"].strip().lower() == name.lower():
            participant = p
            break

    if participant:
        # If a password was set, check it matches
        participant_pw = participant.get("password", "")
        if participant_pw and password != participant_pw:
            return jsonify({"error": "Incorrect password"}), 403
        participant["availability"] = slots
    else:
        participants.append({
            "name": name,
            "password": password,
            "availability": slots
        })

    # Save back to DB
    mongo.db.events.update_one(
        {"_id": ObjectId(event_id)},
        {"$set": {"participants": participants}}
    )

    return jsonify({"success": True})