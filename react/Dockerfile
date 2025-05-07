# syntax=docker/dockerfile:1.4

# Multi-stage Image Build
# Stage 1 - Clean-Install node packages
FROM node:22.15-bookworm AS development

ARG NPM_TOKEN

ENV CI=true
ENV PORT=3000
ENV APP_HOME="/code"

WORKDIR ${APP_HOME}

COPY ./package.json ${APP_HOME}/
COPY ./package-lock.json ${APP_HOME}/

RUN npm config set @asu:registry https://npm.pkg.github.com/ && \
  npm config set -- '//npm.pkg.github.com/:_authToken' ${NPM_TOKEN} && \
  npm ci

COPY . ${APP_HOME}

CMD [ "npm", "start" ]

# Stage 2 - Build node app
FROM development AS builder

RUN npm run build

# Stage 3 - Build optimized environment with Docker dev tools
FROM development AS dev-envs
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

# Stage 4 - Build optimized production deployment
FROM nginx:1.28-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./htpasswd /usr/share/nginx/.htpasswd

COPY --from=builder /code/dist /usr/share/nginx/html
