#!/bin/sh

(
    cd docker/soi24-devcontainer
    docker compose down -v
)

docker image rm localhost/soi24/debian-dev:1
