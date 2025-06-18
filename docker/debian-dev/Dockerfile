FROM debian:12

ARG CREATE_USER=demo
ARG CREATE_UID=1000
ARG CREATE_GID=1000

# Copy source filesystem
COPY ["rootfs", "/"]

# Init filesystem
RUN /bin/sh -xe /.docker-image/init.sh

# Create user
RUN /bin/sh -xe /usr/local/bin/create-user.sh "${CREATE_USER}" "${CREATE_UID}" "${CREATE_GID}"

# Install JDK LTS
RUN /bin/sh -xe /.docker-image/java-install/jdk-17.0.12+7.sh

# Install Apache Maven
RUN /bin/sh -xe /.docker-image/apache-maven-install/mvn-3.9.9.sh

# Install NodeJS LTS
RUN /bin/sh -xe /.docker-image/nodejs-install/nodejs-20.17.0.sh

# Cleanup filesystem
RUN /bin/sh -xe /.docker-image/cleanup.sh

# Set global env vars
ENV JAVA_HOME=/opt/jdk \
    NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

# Use a shell as default command
CMD ["/bin/bash"]
