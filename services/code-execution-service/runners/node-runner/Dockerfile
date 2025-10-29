FROM node:20-slim

WORKDIR /tmp

# Copy entrypoint
COPY entrypoint.js /usr/local/bin/entrypoint.js
RUN chmod +x /usr/local/bin/entrypoint.js

# Create non-root user
RUN useradd -m -u 1000 runner && \
    chown -R runner:runner /tmp

USER runner

ENTRYPOINT ["node", "/usr/local/bin/entrypoint.js"]
