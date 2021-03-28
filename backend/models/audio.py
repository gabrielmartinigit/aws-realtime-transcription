import boto3
import config
import base64
import json

def upload_audio(filename, audio_base64):
    s3 = boto3.resource('s3')
    bucket = config.s3_bucket
    path = 'audio/'
    extension = '.mp3'
    location = f'{path}{filename}{extension}'

    obj = s3.Object(bucket,f'{path}{filename}{extension}')
    obj.put(Body=base64.b64decode(audio_base64))

    return location

def save_audio(id, path, bucket=config.s3_bucket, status=0):
    ddb = boto3.client('dynamodb')
    table = config.audio_table

    audio_object = {
        'audio_id' : id,
        'bucket': bucket,
        'audio_path': path,
        'trans_status': status
    }
    
    response = ddb.execute_statement(
        Statement=f'INSERT INTO "{table}" VALUE {audio_object}'
    )

    return response

def get_audios():
    ddb = boto3.client('dynamodb')
    table = config.audio_table

    response = ddb.execute_statement(
        Statement=f'SELECT * FROM "{table}"'
    )


    audios_object = []
    for audio in response['Items']:
        audio_object = {
            'audio_id' : audio['audio_id']['S'],
            'bucket': audio['bucket']['S'],
            'audio_path': audio['audio_path']['S'],
            'trans_status': audio['trans_status']['N']
        }

        audios_object.append(audio_object)

    return audios_object

def get_audio(id):
    ddb = boto3.client('dynamodb')
    table = config.audio_table

    response = ddb.execute_statement(
        Statement=f'SELECT * FROM "{table}" WHERE audio_id=\'{id}\''
    )

    audio_object = {
        'audio_id' : response['Items'][0]['audio_id']['S'],
        'bucket': response['Items'][0]['bucket']['S'],
        'audio_path': response['Items'][0]['audio_path']['S'],
        'trans_status': response['Items'][0]['trans_status']['N']
    }

    return audio_object

def generate_audio_url(id):
    s3 = boto3.client('s3')
    audio = get_audio(id)
    bucket = audio['bucket']
    path = audio['audio_path']

    presigned_url = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket,
                'Key': path
            },
        ExpiresIn=3600
    )

    return presigned_url