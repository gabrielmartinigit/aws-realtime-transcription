from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import json
import time
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
    payload = json.loads(request.data)
    audio_id = payload['audio_id']
    audio_path = payload['audio_path']
    audio_bucket = payload['bucket']
    status = ''

    transcription_job = transcription.start_transcribe(audio_id, f'{audio_bucket}/{audio_path}')

    transcription.save_transcription(transcription_job['job_id'], transcription_job['transcription_path'], transcription_job['bucket'], audio_id)

    while status != 'COMPLETED':
        time.sleep(3)
        status = transcription.get_job_status(transcription_job['job_id'])

    response = transcription_job

    return jsonify(response), 200

@app.route('/transcriptions', methods=['GET'])
def get_transcriptions():
    response = transcription.get_transcriptions()

    return jsonify(response), 200

@app.route('/transcriptioncontent', methods=['GET'])
def get_transcription_content():
    trans_id = request.args.get('id') # ?id=

    transcription_content = transcription.get_transcription_content(trans_id)

    ## TODO
    phrases = transcription.separate_phrases(transcription_content)
    srt = transcription.write_srt(phrases)

    response = {
        'content': srt
    }

    return jsonify(response), 200
    

@app.route('/transcriptionurl', methods=['GET'])
def get_transcription_url():
    trans_id = request.args.get('id') # ?id=

    transcription_url = transcription.generate_transcription_url(trans_id)
    
    response = {
        "url": transcription_url
    }

    return jsonify(response), 200

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
    app.run(host="0.0.0.0", port=80)