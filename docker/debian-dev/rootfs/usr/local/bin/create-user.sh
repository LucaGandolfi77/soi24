#!/bin/sh

user=${1:-"demo"}
uid=${2:-"1000"}
gid=${3:-"1000"}

groupadd -g "${gid}" "${user}"
useradd --create-home -u "${uid}" -g "${gid}" -s /bin/bash "${user}"
