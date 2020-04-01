from flask import Flask, render_template
from flask_socketio import SocketIO, send
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET')
socketio = SocketIO(app, manage_session=False, cors_allowed_origins="*", engineio_logger=True, logger=True)

calculations_history = []
capacity = 10

# Pre-process server queue storing calculation logs to be passed as a single string
def generate_out():
    stringBuilder = ''
    for val in reversed(calculations_history):
        stringBuilder += str(val) + ";"
    return stringBuilder

# Receive calculation log from a client and fan out to all clients connected
@socketio.on('message')
def message(data):
    if len(calculations_history) >= 10:
        calculations_history.pop(0)
    split_data = data.split(" ")
    formatted_data = ''
    for val in split_data:
        if val.replace(".","",1).isdigit():
            formatted_val = '{:,}'.format(float(val))
            formatted_data += formatted_val.replace(".0","") if formatted_val.endswith(".0") else formatted_val 
        else:
            formatted_data += val
        formatted_data += " "
    formatted_data = "".join(list(formatted_data)[:-1])
    calculations_history.append(formatted_data)
    output = generate_out()
    send(str(output), broadcast = True)

# Render website when a client connects to the server for the first time
@app.route('/', methods = ['GET'])  
def initial_fetch():
    return render_template("index.html", calcHist = list(reversed(calculations_history)))

if __name__ == '__main__':
    socketio.run(app, debug = True)