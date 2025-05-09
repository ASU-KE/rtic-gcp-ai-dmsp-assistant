# syntax=docker/dockerfile:1.4

# Multi-stage Image Build
# Stage 1 - Clean-Install node packages and compile TS code
FROM node:22.15-bookworm AS builder

WORKDIR /code

# default to port 3001 for node, and 9229 and 9230 (tests) for debug
ARG PORT=3001
ENV PORT=$PORT
EXPOSE $PORT 9229 9230

COPY ./package.json /code/package.json
COPY ./package-lock.json /code/package-lock.json
RUN npm ci

# copy in our source code last, as it changes the most
COPY . /code

# Build application
RUN npm run clean
RUN npm run compile

# Stage 2 - Build optimized environment with Docker dev tools
FROM builder AS dev-envs
RUN  <<EOF
apt-get update
apt-get install -y --no-install-recommends git
EOF

RUN  <<EOF
useradd -s /bin/bash -m vscode
groupadd docker
usermod -aG docker vscode
EOF

# install Docker tools (cli, buildx, compose)
COPY --from=gloursdocker/docker / /
CMD [ "npm", "start" ]

# Stage 3 - Build optimized production deployment
FROM nginx:1.28-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /code/dist /usr/share/nginx/html
