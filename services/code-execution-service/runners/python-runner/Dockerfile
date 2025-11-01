FROM python:3.13-slim

WORKDIR /tmp

# Copy entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create non-root user
RUN useradd -m -u 1001 runner && \
    chown -R runner:runner /tmp

USER runner

# Security: read-only filesystem, no network
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
