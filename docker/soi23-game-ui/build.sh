#!/bin/sh

this_dir_relative=..
. "${this_dir_relative}/env.sh"

webapp_path=${workspace_root}/soi23-game-ui/dist/soi23-game-ui
webapp_dst_path=src/rootfs/usr/local/apache2/htdocs

rm -rf "${webapp_dst_path}"
cp -rf "${webapp_path}/" "${webapp_dst_path}"

docker build -t soi23-game-ui:1.0 src
