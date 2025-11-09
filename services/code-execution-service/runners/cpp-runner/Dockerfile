FROM gcc:13-bookworm

WORKDIR /tmp

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    coreutils \
    && rm -rf /var/lib/apt/lists/*

# Copy entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create non-root user
RUN useradd -m -u 1001 runner && \
    chown -R runner:runner /tmp

USER runner

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
