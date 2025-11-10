FROM eclipse-temurin:21-jdk-alpine

WORKDIR /tmp

# Install dependencies
RUN apk add --no-cache bash coreutils

# Copy entrypoint and fix line endings
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh && \
    sed -i 's/\r$//' /usr/local/bin/entrypoint.sh

# Create non-root user
RUN adduser -D -u 1001 runner && \
    chown -R runner:runner /tmp

USER runner

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
