#!/bin/sh

this_dir_relative=..
. "${this_dir_relative}/env.sh"

jar_version="1.0.0-SNAPSHOT"
jar_path=${workspace_root}/soi23-game-web-server/target/soi23-game-web-server-${jar_version}.jar
jar_dst_path=src/rootfs/opt/app/soi23-game-web-server.jar

rm -f "${jar_dst_path}"
cp -f "${jar_path}" "${jar_dst_path}"

docker build -t soi23-game-web-server:1.0 src
