FROM node:20-slim

# Install FFmpeg, Python, and dependencies for yt-dlp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Set environment variables defaults
ENV PORT=7860
EXPOSE 7860

# Start worker orchestrator daemon
CMD ["node", "workers/start-all.js"]
