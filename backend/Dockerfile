FROM ubuntu:20.04

RUN apt update -y && \
    apt upgrade -y && \
    apt install -y python3-pip python3-dev

COPY ./requirements.txt /app/requirements.txt

WORKDIR /app

RUN pip3 install -r requirements.txt

COPY . /app

EXPOSE 5000

CMD ["python3", "app.py" ]