from flask import Flask
app = Flask(__name__)

@app.route('/')
def healthcheck():
    return '200'

@app.route('/transcribe', method='GET')
def generate_transcribe_url():
    return '200'

@app.route('/transcriptions', method='GET')
def get_transcriptions():
    return '200'

@app.route('/transcription?id', method='GET')
def get_transcription():
    return '200'

@app.route('/transcription', method='POST')
def save_transcription():
    # Id (date-hour-id) = audio file name
    # Segments (person, text, confidence, start time, end time, repaired words)
    # Author
    # Number of repairs
    return '200'

if __name__ == '__main__':
    app.debug = True
    app.run(host="0.0.0.0")