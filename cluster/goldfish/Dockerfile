FROM alpine:3.6

# Version of goldfish to install
ENV GOLDFISH_VERSION=v0.8.0

WORKDIR /app

# Install Goldfish binary and clean up
RUN apk --no-cache add \
  --virtual build-dependencies \
  unzip && \
  apk --no-cache add \
  jq \
  curl \
  ca-certificates && \
  curl -L -o goldfish https://github.com/Caiyeon/goldfish/releases/download/$GOLDFISH_VERSION/goldfish-linux-amd64 && \
  chmod +x ./goldfish && \
  apk del build-dependencies

COPY docker.hcl .
COPY entrypoint.sh .

RUN chmod +x ./entrypoint.sh

EXPOSE 8000

#Default command to run, however we run entrypoint.sh in docker-compose
CMD /app/goldfish -config=/app/config.hcl -token=${VAULT_TOKEN}
