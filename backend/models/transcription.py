import boto3
import config
import json
import re
import models.audio as audio

def start_transcribe(id, audio_path):
    transcribe = boto3.client('transcribe')
    
    response = transcribe.start_transcription_job(
        TranscriptionJobName=id,
        LanguageCode='pt-BR',
        MediaFormat='mp3',
        Media={
            'MediaFileUri': f's3://{audio_path}'
        },
        OutputBucketName=config.s3_bucket,
        OutputKey=f'transcription/{id}.json',
        Settings={
            'ShowSpeakerLabels': True,
            'MaxSpeakerLabels': 10,
            'ShowAlternatives': True,
            'MaxAlternatives': 3,
        }
    )

    transcription_job = {
        'job_id': id,
        'bucket': config.s3_bucket,
        'transcription_path': f'transcription/{id}.json',
    }

    return transcription_job

def save_transcription(id, path, bucket, audio_id):
    ddb = boto3.client('dynamodb')
    table = config.trans_table
    status = 0

    transcription_object = {
        'trans_id': id,
        'trans_path': path,
        'bucket': bucket,
        'audio_id': audio_id,
        'status': status
    }
    
    response = ddb.execute_statement(
        Statement=f'INSERT INTO "{table}" VALUE {transcription_object}'
    )

    return response

def get_transcriptions():
    ddb = boto3.client('dynamodb')
    table = config.trans_table

    response = ddb.execute_statement(
        Statement=f'SELECT * FROM "{table}"'
    )

    transcriptions_object = []
    for transcription in response['Items']:
        transcription_object = {
            'trans_id': transcription['trans_id']['S'],
            'bucket': transcription['bucket']['S'],
            'trans_path': transcription['trans_path']['S'],
            'audio_id': transcription['audio_id']['S'],
            'status': transcription['status']['N']
        }

        transcriptions_object.append(transcription_object)

    return transcriptions_object

def get_transcription(id):
    ddb = boto3.client('dynamodb')
    table = config.trans_table

    response = ddb.execute_statement(
        Statement=f'SELECT * FROM "{table}" WHERE trans_id=\'{id}\''
    )

    transcription_object = {
        'trans_id': response['Items'][0]['trans_id']['S'],
        'bucket': response['Items'][0]['bucket']['S'],
        'trans_path': response['Items'][0]['trans_path']['S'],
        'audio_id': response['Items'][0]['audio_id']['S'],
        'status': response['Items'][0]['status']['N']
    }

    return transcription_object

def get_job_status(trans_id):
    transcribe = boto3.client('transcribe')

    response = transcribe.get_transcription_job(
        TranscriptionJobName=trans_id
    )

    if response['TranscriptionJob']['TranscriptionJobStatus'] == 'COMPLETED':
        update_transcription_status(trans_id)
        audio.update_audio_status(trans_id)

    status = response['TranscriptionJob']['TranscriptionJobStatus']

    return status

def get_transcription_content(id):
    s3 = boto3.resource('s3')
    transcription = get_transcription(id)
    bucket = transcription['bucket']
    path = transcription['trans_path']

    content_object = s3.Object(bucket, path)
    file_content = content_object.get()['Body'].read().decode('utf-8')
    transcription_content = json.loads(file_content)

    return transcription_content

def getTimeCode( seconds ):
	t_seconds = int( seconds )
	t_secs = ((float( t_seconds) / 60) % 1) * 60
	t_mins = int( t_seconds / 60 )
	return str( "%02d:%02d:%02d" % (00, t_mins, int(t_secs)))

def newPhrase():
	return { 'start_time': '', 'end_time': '', 'words' : [] }

def separate_phrases(ts):
    # Now create phrases from the translation
	items = ts['results']['items']
	
	#set up some variables for the first pass
	phrase =  newPhrase()
	phrases = []
	nPhrase = True
	x = 0
	c = 0

	for item in items:
		# if it is a new phrase, then get the start_time of the first item
		if nPhrase == True:
			if item["type"] == "pronunciation":
				phrase["start_time"] = getTimeCode( float(item["start_time"]) )
				nPhrase = False
			c+= 1
		else:	
			# get the end_time if the item is a pronuciation and store it
			# We need to determine if this pronunciation or puncuation here
			# Punctuation doesn't contain timing information, so we'll want
			# to set the end_time to whatever the last word in the phrase is.
			if item["type"] == "pronunciation":
				phrase["end_time"] = getTimeCode( float(item["end_time"]) )
				
		# in either case, append the word to the phrase...
		if item['alternatives'][0]["content"] != "[REJECT]":
			phrase["words"].append(item['alternatives'][0]["content"])
			x += 1
		
		# now add the phrase to the phrases, generate a new phrase, etc.
		if x == 10:
			#print c, phrase
			phrases.append(phrase)
			phrase = newPhrase()
			nPhrase = True
			x = 0
	
	# if there are any words in the final phrase add to phrases  
	if(len(phrase["words"]) > 0):
		phrases.append(phrase)	
				
	return phrases

def getPhraseText(phrase):
	length = len(phrase["words"])
	out = ""

	for i in range( 0, length ):
		if re.match( '[a-zA-Z0-9]', phrase["words"][i]):
			if i > 0:
				out += " " + phrase["words"][i]
			else:
				out += phrase["words"][i]
		else:
			out += phrase["words"][i]

	return out
	

def write_srt(phrases):
    srt = ''
    x=1

    for phrase in phrases:
        # determine how many words are in the phrase
        length = len(phrase["words"])

        # write out the phrase number
        # srt += str(x)+"\n"
        x += 1

        # write out the start and end time
        # srt += phrase["start_time"]+" --> "+phrase["end_time"]+"\n"

        # write out the full phase.  Use spacing if it is a word, or punctuation without spacing
        out = getPhraseText(phrase)

        srt += out + "\n\n"

    return srt

def generate_transcription_url(id):
    s3 = boto3.client('s3')
    transcription = get_transcription(id)
    bucket = transcription['bucket']
    path = transcription['trans_path']

    presigned_url = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket,
                'Key': path
            },
        ExpiresIn=3600
    )

    return presigned_url

def update_transcription_status(id):
    ddb = boto3.client('dynamodb')
    table = config.trans_table

    response = ddb.execute_statement(
        Statement=f'UPDATE "{table}" SET status=1 WHERE trans_id=\'{id}\''
    )

    return response
