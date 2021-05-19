from flask import Flask, json, request
from flask.helpers import send_file
from flask_cors import CORS
from flask import jsonify
from convert import train_new_model
from database import *


app = Flask(__name__)
CORS(app)

setup_database()

@app.route('/gesture', methods=['POST'])
def gesture():
    json_data = request.get_json()
    checked = json_data["checked"]
    model_id = json_data["model_id"]
    accel_data = json_data["acclerometerData"]
    magnet_data = json_data["magnetometerData"]
    add_gesture(checked, accel_data, magnet_data, model_id)
    train_new_model(model_id)
    return jsonify(success=True)

@app.route('/create_model', methods=['POST'])
def create_model():
    json_data = request.get_json()
    name = json_data["name"]
    tickCount = json_data["tickCount"]
    description = json_data["description"]
    add_model(name, description, tickCount)
    return jsonify(success=True)

@app.route('/get_models', methods=['GET'])
def get_models():
    return {"models": get_all_models()}

@app.route('/get_model', methods=['POST'])
def get_model():
    model_id = request.get_json()["id"]
    return get_gesture_model(model_id)

@app.route('/delete_model', methods=['POST'])
def delete_model():
    model_id = request.get_json()["id"]
    delete_gesture_model(model_id)
    return jsonify(success=True)

@app.route('/train_model', methods=['POST'])
def train_model():
    model_id = request.get_json()["id"]
    train_new_model(model_id)
    return jsonify(success=True)

@app.route('/get_trained_model', methods=['POST'])
def get_trained_model():
    model_id = request.get_json()["id"]
    f = open(f"./learners/model-{model_id}/web_model/model.json")
    return json.load(f)

@app.route('/get_model_part/<id>/<file>', methods=['GET'])
def get_model_part(id, file):
    return send_file(f"./learners/model-{id}/web_model/{file}")