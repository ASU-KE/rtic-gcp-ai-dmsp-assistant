# syntax=docker/dockerfile:1.4

# Multi-stage Image Build
# Stage 1 - Clean-Install node packages
FROM node:22.9-bookworm AS development

ENV CI=true
ENV PORT=3000
ENV APP_HOME="/code"

WORKDIR ${APP_HOME}

COPY package.json ${APP_HOME}/
COPY package-lock.json ${APP_HOME}/

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
COPY . ${APP_HOME}

CMD [ "npm", "start" ]

# Stage 2 - Build node app
FROM development AS builder

RUN npm run build

# Stage 3 - Build optimized environment with Docker dev tools
FROM development as dev-envs
RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends git
EOF

RUN <<EOF
useradd -s /bin/bash -m vscode
groupadd docker
usermod -aG docker vscode
EOF
# install Docker tools (cli, buildx, compose)
COPY --from=gloursdocker/docker / /
CMD [ "npm", "start" ]

# Stage 4 - Build optimized production deployment
FROM nginx:1.13-alpine

COPY --from=builder /code/build /usr/share/nginx/html
