#!/bin/sh -xe

docker build \
    --build-arg CREATE_USER=${USER} \
    --build-arg CREATE_UID=$(id -u) \
    --build-arg CREATE_GID=$(id -g) \
    -t localhost/soi24/debian-dev:1 \
    .
