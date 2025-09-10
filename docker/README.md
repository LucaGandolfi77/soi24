# SOI 2023 - Docker project

## ENV LOCAL

In order to use `build.sh` scripts to build the images, you need to edit the `env-local.sh` file, parameter `workspace_root`, with the path of your project (folder which contains folders docker, soi23-game-ui, soi23-game-web-server).

> Note that if you are using WSL, the Windows `C:` disk is mapped to `/mnt/c`

## Build local projects

In order to build both front-end and back-end docker images, you need to have already available the static page files and the Jar file respectively. You do not need to move them if you are using `build.sh` scripts.

Front-end: run `nx build` to build the static page files.\
Back-end: execute `mvn clean install` with Maven to create the Jar file.


## WSL Port Forwarding

In order to reach the Docker Compose port inside WSL from the LAN,
you have to type in the Windows terminal as Administrator
```
netsh interface portproxy set v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=$(wsl hostname -I)
```

You then have to type
```
netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0
```
in order to remove the port forwarding.
