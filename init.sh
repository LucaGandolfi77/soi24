#!/bin/sh

(
    cd docker/debian-dev
    /bin/sh -xe build.sh
)

mkdir /home/${USER}/.m2

docker run --rm \
    -u "${USER}" \
    -v "/home/${USER}/.m2:/home/${USER}/.m2" \
    -v ".:/workspace" \
    localhost/soi24/debian-dev:1 \
    /bin/bash -xec " \
        source /etc/profile
        echo PATH=\${PATH}
        cd /workspace/soi24-game-web-server
        mvn clean
        cd /workspace/soi24-game-ui
        npm install
    "
