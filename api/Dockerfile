# syntax=docker/dockerfile:1.4

# Multi-stage Image Build
# Stage 1 - Clean-Install node packages and compile TS code
FROM node:22.16-bookworm AS builder

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
RUN npm run build

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

# Stage 3 - Production-optimized final image
FROM node:22.16-bookworm-slim AS production

WORKDIR /code

# Only copy production dependencies
COPY --from=builder /code/package.json /code/package.json
COPY --from=builder /code/package-lock.json /code/package-lock.json
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /code/dist /code/dist

# Copy any other necessary files (e.g., static assets, config)
# COPY --from=builder /code/public /code/public

ENV NODE_ENV=production
ARG PORT=8080
ENV PORT=$PORT
EXPOSE $PORT

CMD [ "node", "dist/index.js" ]
