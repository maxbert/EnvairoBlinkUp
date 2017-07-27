#!/bin/bash

set -x
set -e

source ./deployment/config/base.env

function set_env() {
    if [ -n "${ENV_PROD+set}" ]; then
	    echo "Setting prod environment..."
	    COMPOSE_FILE=./deployment/config/docker-compose.yml
	    source ./deployment/config/prod.env
    fi
}

function docker_build () {
    set_env
    docker-compose -f $COMPOSE_FILE build
}

function docker_up () {
    set_env
    docker-compose -f $COMPOSE_FILE up -d
}

function docker_clean () {
    set_env
    docker-compose -f $COMPOSE_FILE clean
}

function docker_rm () {
    set_env
    docker-compose -f $COMPOSE_FILE stop
    docker-compose -f $COMPOSE_FILE rm -f --all
}

function docker_test () {
    set_env
    docker-compose -f $COMPOSE_FILE exec web python app .py 
}

case "$1" in
    "build")
        docker_build
        ;;
    "up")
        docker_up
        ;;
    "bounce")
        docker_build
	docker_up
        ;;
    "clean")
	docker_clean
	;;
    "rm")
	docker_rm
	;;
    "test")
	#docker_test
	;;
    "web")
	shift;
	case "$1" in
	    "runserver")
		docker exec -it dashboard_web_1 python app.py 
		;;
	    "bash")
		docker exec -it dashboard_web_1 bash
		;;
	    *)
		echo "Usage: $(basename $0) web [runserver | bash]"
		;;
	esac
	;;
    *)
	echo "Usage: $(basename $0) [build | up | bounce | rm | clean | web [runserver]]"
        ;; 
esac
