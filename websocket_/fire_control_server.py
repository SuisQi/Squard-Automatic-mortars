from flask import Flask, request

from API.R import R
from websocket_.public import mortar_control_pool

app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/get_target', methods=["GET"])
def get_target():
    sessionId = request.args.get("sessionId")
    userId = request.args.get("userId")
    mortar_control = mortar_control_pool[sessionId]
    target_id = mortar_control.assign_fire_point(userId)
    if not target_id:
        return R(500)
    return R(0, data={"targetId": target_id})

@app.route("/check_fires", methods=["GET"])
def check_fires():
    sessionId = request.args.get("sessionId")
    mortar_control = mortar_control_pool[sessionId]
    mortar_control.check_and_notify_all_fp_assigned()
    return R(0)

@app.route("/unfire", methods=["GET"])
def unfire():
    sessionId = request.args.get("sessionId")
    userId = request.args.get("userId")
    target_id = request.args.get("targetId")
    mortar_control = mortar_control_pool[sessionId]
    mortar_control.unmark_fire_point_as_unreachable(userId, target_id)
    return R(0)


@app.route("/add_fire", methods=["GET"])
def add_fire():
    session_id = request.args.get("sessionId")
    target_id = request.args.get("targetId")
    control = mortar_control_pool[session_id]
    control.add_fire_point(target_id)
    return R(0)


@app.route("/remove_all", methods=["GET"])
def remove_all():
    session_id = request.args.get("sessionId")
    if session_id in mortar_control_pool:
        control = mortar_control_pool[session_id]
        control.remove_all_fire_points()
    return R(0)


@app.route("/remove_fire", methods=["GET"])
def remove_fire():
    session_id = request.args.get("sessionId")
    target_id = request.args.get("targetId")
    control = mortar_control_pool[session_id]
    control.remove_fire_point(target_id)
    return R(0)


def run_control_server():
    app.run(debug=False, host='0.0.0.0', port=8081)
