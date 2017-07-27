#!/bin/bash

set -e
set -x

if [ $# -ne 2 ]; then
    echo "Usage: ./deployment/bin/bootstrap.sh <user> <hostname>"
    echo "E.g., ./deployment/bin/bootstrap.sh ec2-user staging.envairo.com"
    exit 1
fi

ssh $1@$2 "sudo yum update -y"
ssh $1@$2 "sudo mkdir -p /code /mnt/docker/data"
ssh $1@$2 "sudo chown -R $1 /code /mnt/docker/data"
ssh $1@$2 "sudo yum install -y docker"
ssh $1@$2 "sudo pip install docker-compose"
ssh $1@$2 "sudo usermod -a -G docker $1"
