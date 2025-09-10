#!/bin/sh

this_dir_relative=${this_dir_relative:-$(dirname "$0")}
this_dir="$(cd "${this_dir_relative}" && pwd -P)"

[ -f "${this_dir}/env-local.sh" ] && . "${this_dir}/env-local.sh"

workspace_root=${workspace_root:-"~/soi23"}
