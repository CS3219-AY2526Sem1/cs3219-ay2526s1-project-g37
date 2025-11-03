FROM python:3.12-slim

WORKDIR /app

# Install AWS CLI and kubectl for EKS authentication (multi-arch support)
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  curl \
  unzip \
  && ARCH=$(dpkg --print-architecture) \
  && if [ "$ARCH" = "amd64" ]; then \
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; \
  elif [ "$ARCH" = "arm64" ]; then \
  curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"; \
  else \
  echo "Unsupported architecture: $ARCH" && exit 1; \
  fi \
  && unzip awscliv2.zip \
  && ./aws/install \
  && rm -rf aws awscliv2.zip \
  && curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/${ARCH}/kubectl" \
  && chmod +x kubectl \
  && mv kubectl /usr/local/bin/ \
  && apt-get remove -y curl unzip \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Non-root user for security
RUN useradd -m -u 1000 appuser && \
  chown -R appuser:appuser /app && \
  mkdir -p /home/appuser/.kube && \
  chown -R appuser:appuser /home/appuser/.kube

USER appuser

EXPOSE 8000

# CMD ["fastapi", "run", "app/main.py", "--port", "8000"]
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "--wait-for-client", "--log-to-stderr", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]