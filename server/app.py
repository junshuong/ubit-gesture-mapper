from flask import Flask, request
from flask_cors import CORS
from flask import jsonify
from database import add_gesture

app = Flask(__name__)
CORS(app)

@app.route('/gesture', methods=['POST'])
def gesture():
    json_data = request.get_json()
    checked = json_data["checked"]
    data = json_data["data"]
    add_gesture(checked, data)
    return jsonify(success=True)