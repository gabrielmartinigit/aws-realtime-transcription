import boto3
import config
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
        'trans_id': transcription['trans_id']['S'],
        'bucket': transcription['bucket']['S'],
        'trans_path': transcription['trans_path']['S'],
        'audio_id': transcription['audio_id']['S'],
        'status': transcription['status']['N']
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

    status = {
        'status': response['TranscriptionJob']['TranscriptionJobStatus']
    }

    return status

def update_transcription_status(id):
    ddb = boto3.client('dynamodb')
    table = config.trans_table

    response = ddb.execute_statement(
        Statement=f'UPDATE "{table}" SET status=1 WHERE trans_id=\'{id}\''
    )

    return response
