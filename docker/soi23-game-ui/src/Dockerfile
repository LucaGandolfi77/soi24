FROM httpd:2.4

# Copy source filesystem
COPY ["rootfs", "/"]

# Extend the original configuration
RUN echo "Include conf.d/*.conf" >> /usr/local/apache2/conf/httpd.conf
