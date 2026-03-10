FROM ghcr.io/puppeteer/puppeteer:24.38.0

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .


# Create session folder
RUN mkdir -p sessions

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

CMD ["node","server.js"]
