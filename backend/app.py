from flask import Flask
from flask import Response
import models.audio as audio
import models.transcription as transcription
import boto3

app = Flask(__name__)

@app.route('/')
def healthcheck():
    return Response('{"Health":"OK"}', status=200, mimetype='application/json')

@app.route('/transcribe', methods=['GET'])
def generate_transcribe_url():
    return Response('{"URL":"transcribe_uri"}', status=200, mimetype='application/json')

@app.route('/transcribeasync', methods=['GET'])
def start_transcribe_job():
    return Response("{'jobid':'transcribe_uri'}", status=200, mimetype='application/json')

@app.route('/transcribeasync', methods=['POST'])
def get_transcribe_job():
    return Response("{'jobid':'transcribe_uri', 'status':'running'}", status=200, mimetype='application/json')

@app.route('/transcriptions', methods=['GET'])
def get_transcriptions():
    return Response("{'jobid':'transcribe_uri'}", status=200, mimetype='application/json')

@app.route('/transcription?id', methods=['GET'])
def get_transcription():
    return Response("{'jobid':'transcribe_uri'}", status=200, mimetype='application/json')

@app.route('/transcription', methods=['POST'])
def save_transcription():
    # Id (date-hour-id) = audio file name
    # Segments (person, text, confidence, start time, end time, repaired words)
    # AsyncStatus
    # Author
    return Response("{'jobid':'transcribe_uri'}", status=200, mimetype='application/json')

@app.route('/audio', methods=['POST'])
def save_audio():
    # Id (date-hour-id) = audio file name
    # Status
    return Response("{'jobid':'transcribe_uri'}", status=200, mimetype='application/json')

if __name__ == '__main__':
    app.debug = True
    app.run(host="0.0.0.0")