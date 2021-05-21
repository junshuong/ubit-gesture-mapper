import io
import logging

import toml
from flask import Flask, Response, json, jsonify, request
from flask.helpers import send_file
from flask_cors import CORS

from convert import train_new_model
from database import *
from influx import write_to_influx

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
    description = json_data["description"]
    add_model(name, description)
    return jsonify(success=True)


@app.route('/create_gesture', methods=['POST'])
def add_gesture():
    json_data = request.get_json()
    name = json_data["name"]
    model_id = json_data["id"]
    classification = json_data["classification"]
    create_gesture(name, model_id, classification)
    return jsonify(success=True)


@app.route('/add_capture', methods=['POST'])
def add_capture():
    json_data = request.get_json()
    classification = json_data["classification"]
    gesture_id = json_data["gesture_id"]
    accel_data = json_data["acclerometerData"]
    magnet_data = json_data["magnetometerData"]
    create_capture(classification, accel_data, magnet_data, gesture_id)
    return jsonify(success=True)

@app.route('/get_gesture/<gesture_id>', methods=['GET'])
def get_gesture(gesture_id):
    return get_gesture_from_db(gesture_id)



@app.route('/get_models', methods=['GET'])
def get_models():
    return {"models": get_all_models()}


@app.route('/get_model/<model_id>', methods=['GET'])
def get_model(model_id):
    return get_model_from_db(model_id)

@app.route('/remove_gesture', methods=['POST'])
def remove_gesture():
    g_id = request.get_json()["gesture_id"]
    delete_gesture(g_id)
    return jsonify(success=True)


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

@app.route('/update_mapping', methods=['POST'])
def update_mapping():
    json_data = request.get_json()
    gesture_id = json_data["gesture_id"]
    using_file = json_data["using_file"]
    file_name = json_data["file_name"]
    update_mapping_db(gesture_id, using_file, file_name)
    return jsonify(success=True)
    
@app.route('/get_audio_file/<file_name>', methods=['GET'])
def get_audio_file(file_name):
    with open(f"./audio-files/{file_name}.mp3", 'rb') as bites:
        return send_file(
                io.BytesIO(bites.read()),
                attachment_filename='audio.mp3',
                mimetype='audio/mpeg'
            )

@app.route('/save_to_db', methods=['POST'])
def save_to_db():
    """POST route to handle data that should be written to InfluxDB"""
    try:
        # Attempt to load the config file before calling the
        # function to ensure it's present
        toml.load("config.toml")["influxdb"]
        # Get the required data from the request
        gesture_name = request.get_json()["gesture_name"]
        fields = request.get_json()["fields"]
        print(request.get_json())
        # Call the function to write to the database
        return write_to_influx(gesture_name, fields)
    except (FileNotFoundError, KeyError) as err:
        # Return a 500 error if the config is missing or data is malformed
        logging.error(err)
        return Response(status=500, mimetype='application/json')
