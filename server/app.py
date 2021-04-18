from flask import Flask, request
from flask_cors import CORS
from flask import jsonify
from database import *
app = Flask(__name__)
CORS(app)

@app.route('/gesture', methods=['POST'])
def gesture():
    json_data = request.get_json()
    checked = json_data["checked"]
    data = json_data["data"]
    add_gesture(checked, data)
    return jsonify(success=True)

@app.route('/create_model', methods=['POST'])
def create_model():
    json_data = request.get_json()
    name = json_data["name"]
    add_model(name)
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