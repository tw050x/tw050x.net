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

FROM node:23.11.1-alpine3.22 AS library-database
WORKDIR /srv
COPY --from=build /build/library/database/artifact /srv/library/database/artifact
COPY --from=dependencies /dependencies/library/database/node_modules /srv/library/database/node_modules
COPY --from=dependencies /dependencies/library/database/package.json /srv/library/database/package.json

FROM node:23.11.1-alpine3.22 AS library-logger
WORKDIR /srv
COPY --from=build /build/library/logger/artifact /srv/library/logger/artifact
COPY --from=dependencies /dependencies/library/logger/node_modules /srv/library/logger/node_modules
COPY --from=dependencies /dependencies/library/logger/package.json /srv/library/logger/package.json

FROM node:23.11.1-alpine3.22 AS library-middleware
WORKDIR /srv
COPY --from=build /build/library/middleware/artifact /srv/library/middleware/artifact
COPY --from=dependencies /dependencies/library/middleware/node_modules /srv/library/middleware/node_modules
COPY --from=dependencies /dependencies/library/middleware/package.json /srv/library/middleware/package.json

FROM node:23.11.1-alpine3.22 AS library-service
WORKDIR /srv
COPY --from=build /build/library/service/artifact /srv/library/service/artifact
COPY --from=dependencies /dependencies/library/service/node_modules /srv/library/service/node_modules
COPY --from=dependencies /dependencies/library/service/package.json /srv/library/service/package.json

FROM node:23.11.1-alpine3.22 AS library-type-guard
WORKDIR /srv
COPY --from=build /build/library/type-guard/artifact /srv/library/type-guard/artifact
COPY --from=dependencies /dependencies/library/type-guard/node_modules /srv/library/type-guard/node_modules
COPY --from=dependencies /dependencies/library/type-guard/package.json /srv/library/type-guard/package.json

FROM node:23.11.1-alpine3.22 AS library-uikit
WORKDIR /srv
COPY --from=build /build/library/uikit/artifact /srv/library/uikit/artifact
COPY --from=dependencies /dependencies/library/uikit/node_modules /srv/library/uikit/node_modules
COPY --from=dependencies /dependencies/library/uikit/package.json /srv/library/uikit/package.json

# Final Image
FROM node:23.11.1-alpine3.22 AS service-administration
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=build /build/service/administration/artifact /srv/service/administration/artifact
COPY --from=dependencies /dependencies/service/administration/node_modules /srv/service/administration/node_modules
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-type-guard /srv/library/type-guard /srv/library/type-guard
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
CMD [ "node", "service/administration/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS service-assets
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=build /build/service/assets/serve.json /srv/serve.json
COPY --from=build /build/service/assets/public /srv/service/assets/public
COPY --from=dependencies /dependencies/service/assets/node_modules /srv/service/assets/node_modules
ENTRYPOINT [ "sh", "-c" ]
CMD [ "/srv/service/assets/node_modules/.bin/serve --config /srv/serve.json --listen tcp://0.0.0.0:3000" ]

FROM node:23.11.1-alpine3.22 AS service-authentication
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=build /build/service/authentication/artifact /srv/service/authentication/artifact
COPY --from=dependencies /dependencies/service/authentication/node_modules /srv/service/authentication/node_modules
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-type-guard /srv/library/type-guard /srv/library/type-guard
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
CMD [ "node", "service/authentication/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS service-marketing
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=build /build/service/marketing/artifact /srv/service/marketing/artifact
COPY --from=dependencies /dependencies/service/marketing/node_modules /srv/service/marketing/node_modules
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-type-guard /srv/library/type-guard /srv/library/type-guard
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
CMD [ "node", "service/marketing/artifact/serve.js" ]
