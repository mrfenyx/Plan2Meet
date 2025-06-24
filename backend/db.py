from flask_pymongo import PyMongo
import os
from flask import Flask

mongo = PyMongo()

def init_mongo(app: Flask):
    app.config["MONGO_URI"] = os.environ.get("MONGO_URI", "mongodb://localhost:27017/plan2meet")
    mongo.init_app(app)
