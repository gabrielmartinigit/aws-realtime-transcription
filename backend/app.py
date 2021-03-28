from flask import Flask, Response, request, jsonify
from flask_cors import CORS, cross_origin
import json
from datetime import datetime
import models.audio as audio
import models.transcription as transcription

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'

cors = CORS(app) # public api

@app.route('/')
def healthcheck():
    response = {
        'healthcheck': 'health'
    }
    
    return jsonify(response), 200

@app.route('/transcribe', methods=['POST'])
def start_transcribe_job():
    return Response("{'jobid':'transcribe_uri'}", status=200, mimetype='application/json')

@app.route('/transcribe?id', methods=['GET'])
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

@app.route('/audios', methods=['GET'])
def get_audios():
    response = audio.get_audios()

    return jsonify(response), 200

@app.route('/audio', methods=['GET'])
def get_audio():
    audio_id = request.args.get('id') # ?id=
    
    response = audio.get_audio(audio_id)

    return jsonify(response), 200

@app.route('/audio', methods=['POST'])
def save_audio():
    payload = json.loads(request.data)
    audio_id = datetime.now().strftime("%d%m%Y%H%M%S")
    audio_path = audio.upload_audio(audio_id, payload["base64audio"])

    audio.save_audio(audio_id, audio_path)

    response = {
        "audio_id": audio_id,
        "audio_location": audio_path
    }
    
    return jsonify(response), 200

@app.route('/audiourl', methods=['GET'])
def get_audio_url():
    audio_id = request.args.get('id') # ?id=
    audio_url = audio.generate_audio_url(audio_id)
    
    response = {
        "url": audio_url
    }

    return jsonify(response), 200

if __name__ == '__main__':
    app.debug = True
    app.run(host="0.0.0.0")