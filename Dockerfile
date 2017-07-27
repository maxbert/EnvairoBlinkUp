FROM ubuntu:16.04

ENV LAST_UPDATED 2017-07-10

RUN apt-get update -y && apt-get install -y software-properties-common \
    python-software-properties
RUN apt-add-repository ppa:ubuntugis/ubuntugis-unstable
RUN apt-get update -y && apt-get install -y libffi6 libffi-dev build-essential \
    libgdal-dev pari-gp libfreetype6-dev python-matplotlib \
    python-numpy python-pip python-setuptools

RUN pip install --upgrade pip

RUN mkdir -p /code/web
WORKDIR /code/web

ADD requirements.txt /code/web/requirements.txt
RUN pip install -r requirements.txt

ADD . /code/web/

ENV TERM eterm-color

EXPOSE 8000
