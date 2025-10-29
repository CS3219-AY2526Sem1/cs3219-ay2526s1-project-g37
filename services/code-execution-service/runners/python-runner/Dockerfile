FROM python:3.13-slim

WORKDIR /tmp

# Copy entrypoint
COPY entrypoint.py /usr/local/bin/entrypoint.py
RUN chmod +x /usr/local/bin/entrypoint.py

# Create non-root user
RUN useradd -m -u 1000 runner && \
    chown -R runner:runner /tmp

USER runner

# Security: read-only filesystem, no network
ENTRYPOINT ["python3", "/usr/local/bin/entrypoint.py"]
