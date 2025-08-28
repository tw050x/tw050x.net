# Build Image
FROM node:23 AS build
WORKDIR /build
COPY . /build

# Set arguments
ARG NODE_ENV=production

## Set the environment variables
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_ENV=build

## Install all dependencies
RUN yarn install --immutable

## Build the project
RUN yarn workspaces foreach --all run js:compile

# Dendencies Image
FROM node:23 AS dependencies
WORKDIR /dependencies
COPY . /dependencies

# Set arguments
ARG NODE_ENV=production

## Set the environment variables
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_ENV=production

## Install production dependencies
RUN yarn install --immutable

FROM node:23.11.1-alpine3.22 AS assets
RUN apk add --no-cache curl
RUN npm install -g tsx --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=build /build/assets/serve.json /srv/serve.json
COPY --from=build /build/assets/public /srv/assets/public
COPY --from=dependencies /dependencies/assets/node_modules /srv/assets/node_modules
ENTRYPOINT [ "sh", "-c" ]
CMD [ "/srv/assets/node_modules/.bin/serve --config /srv/serve.json --listen tcp://0.0.0.0:3000" ]
