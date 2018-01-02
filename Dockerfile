FROM node:9-alpine

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

RUN mkdir www
WORKDIR /www

COPY package.json package.json
# Pending https://github.com/npm/npm/issues/17091
# COPY package-lock.json package-lock.json
RUN npm install --production

COPY lib/ ./lib
COPY config.js config.js
COPY index.js index.js

ENV PORT 80

CMD ["dumb-init", "node", "index.js"]
