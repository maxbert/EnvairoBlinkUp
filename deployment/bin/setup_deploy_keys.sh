#!/bin/bash

set -e

function add_key() {
    ssh-copy-id -i ./deployment/config/deploy_rsa.pub $1
}

echo "Setting up deploy key..."

ssh-keygen -t rsa -b 4096 -C "build@travis-ci.org" -f ./deployment/config/deploy_rsa
travis encrypt-file ./deployment/config/deploy_rsa --add
mv deploy_rsa.enc ./deployment/config/deploy_rsa.enc

add_key "ec2-user@dashboard.envairo.com"


echo "Deploy key created. Please save your private key in a safe place, then remove it from the repository."
echo "E.g., rm deployment/config/deploy_rsa"
