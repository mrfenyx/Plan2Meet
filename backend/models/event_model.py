from datetime import datetime

def create_event_document(title, description, date_range, time_range, time_step, settings):
    now = datetime.utcnow().isoformat() + "Z"
    return {
        "title": title,
        "description": description,
        "date_range": date_range,   # {'start': 'YYYY-MM-DD', 'end': 'YYYY-MM-DD'}
        "time_range": time_range,   # {'from': 'HH:MM', 'to': 'HH:MM'}
        "time_step_minutes": time_step,
        "participants": [],
        "created_at": now,
        "updated_at": now,
        "settings": settings
    }

def serialize_event(event_doc):
    """Converts Mongo event document to something JSON-serializable."""
    # Convert ObjectId to str
    if "_id" in event_doc:
        event_doc["_id"] = str(event_doc["_id"])
    # You can add more serialization or clean-up if needed
    return event_doc
