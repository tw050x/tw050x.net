# Build Image
FROM node:23.11.1-alpine3.22 AS build
WORKDIR /build
COPY . /build

# Set arguments
ARG NODE_ENV=production

## Set the environment variables
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_ENV=build

## Install all dependencies (including development)
RUN yarn

## Build the project
RUN yarn workspaces foreach \
  --from @tw050x.net.service/portal \
  --from @tw050x.net.service/authentication \
  --from @tw050x.net.service/error \
  --from @tw050x.net.service/marketing \
  --from @tw050x.net.service/navigation \
  --from @tw050x.net.service/user \
  --recursive \
  --topological \
  run tsc

FROM node:23.11.1-alpine3.22 AS dependencies
WORKDIR /srv
COPY .yarn /srv/.yarn
COPY .pnp.cjs /srv/.pnp.cjs
COPY .yarnrc.yml /srv/.yarnrc.yml
COPY package.json /srv/package.json
COPY yarn.lock /srv/yarn.lock

FROM node:23.11.1-alpine3.22 AS database
WORKDIR /srv
COPY --from=build /build/library/database/artifact /srv/library/database/artifact
COPY --from=build /build/library/database/package.json /srv/library/database/package.json
COPY --from=build /build/library/database/tsconfig.json /srv/library/database/tsconfig.json

FROM node:23.11.1-alpine3.22 AS logger
WORKDIR /srv
COPY --from=build /build/library/logger/artifact /srv/library/logger/artifact
COPY --from=build /build/library/logger/package.json /srv/library/logger/package.json
COPY --from=build /build/library/logger/tsconfig.json /srv/library/logger/tsconfig.json

FROM node:23.11.1-alpine3.22 AS middleware
WORKDIR /srv
COPY --from=build /build/library/middleware/artifact /srv/library/middleware/artifact
COPY --from=build /build/library/middleware/package.json /srv/library/middleware/package.json
COPY --from=build /build/library/middleware/tsconfig.json /srv/library/middleware/tsconfig.json

FROM node:23.11.1-alpine3.22 AS service
WORKDIR /srv
COPY --from=build /build/library/service/artifact /srv/library/service/artifact
COPY --from=build /build/library/service/package.json /srv/library/service/package.json
COPY --from=build /build/library/service/tsconfig.json /srv/library/service/tsconfig.json

FROM node:23.11.1-alpine3.22 AS uikit
WORKDIR /srv
COPY --from=build /build/library/uikit/artifact /srv/library/uikit/artifact
COPY --from=build /build/library/uikit/package.json /srv/library/uikit/package.json
COPY --from=build /build/library/uikit/tsconfig.json /srv/library/uikit/tsconfig.json

FROM node:23.11.1-alpine3.22 AS utility
WORKDIR /srv
COPY --from=build /build/library/utility/artifact /srv/library/utility/artifact
COPY --from=build /build/library/utility/package.json /srv/library/utility/package.json
COPY --from=build /build/library/utility/tsconfig.json /srv/library/utility/tsconfig.json

FROM node:23.11.1-alpine3.22 AS portal
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database /srv/library/database /srv/library/database
COPY --from=logger /srv/library/logger /srv/library/logger
COPY --from=middleware /srv/library/middleware /srv/library/middleware
COPY --from=service /srv/library/service /srv/library/service
COPY --from=uikit /srv/library/uikit /srv/library/uikit
COPY --from=utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/portal/artifact /srv/service/portal/artifact
COPY --from=build /build/service/portal/package.json /srv/service/portal/package.json
COPY --from=build /build/service/portal/tsconfig.json /srv/service/portal/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/portal
CMD [ "node", "service/portal/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS assets
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=build /build/service/assets/public /srv/service/assets/public
COPY --from=build /build/service/assets/package.json /srv/service/assets/package.json
COPY --from=build /build/service/assets/tsconfig.json /srv/service/assets/tsconfig.json
COPY --from=build /build/service/assets/serve.json /srv/service/assets/serve.json
RUN yarn workspaces focus --production @tw050x.net.service/assets
ENTRYPOINT [ "sh", "-c" ]
CMD [ "yarn workspace @tw050x.net.service/assets serve --config /srv/service/assets/serve.json --listen tcp://0.0.0.0:3000" ]

FROM node:23.11.1-alpine3.22 AS authentication
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database /srv/library/database /srv/library/database
COPY --from=logger /srv/library/logger /srv/library/logger
COPY --from=middleware /srv/library/middleware /srv/library/middleware
COPY --from=service /srv/library/service /srv/library/service
COPY --from=uikit /srv/library/uikit /srv/library/uikit
COPY --from=utility /srv/library/utility /srv/library/utility
COPY --from=build /build/database/authentication /srv/database/authentication
COPY --from=build /build/database/user /srv/database/user
COPY --from=build /build/service/authentication/artifact /srv/service/authentication/artifact
COPY --from=build /build/service/authentication/package.json /srv/service/authentication/package.json
COPY --from=build /build/service/authentication/tsconfig.json /srv/service/authentication/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/authentication
CMD [ "node", "service/authentication/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS error
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=logger /srv/library/logger /srv/library/logger
COPY --from=middleware /srv/library/middleware /srv/library/middleware
COPY --from=service /srv/library/service /srv/library/service
COPY --from=uikit /srv/library/uikit /srv/library/uikit
COPY --from=utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/error/artifact /srv/service/error/artifact
COPY --from=build /build/service/error/package.json /srv/service/error/package.json
COPY --from=build /build/service/error/tsconfig.json /srv/service/error/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/error
CMD [ "node", "service/error/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS marketing
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database /srv/library/database /srv/library/database
COPY --from=logger /srv/library/logger /srv/library/logger
COPY --from=middleware /srv/library/middleware /srv/library/middleware
COPY --from=service /srv/library/service /srv/library/service
COPY --from=uikit /srv/library/uikit /srv/library/uikit
COPY --from=utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/marketing/artifact /srv/service/marketing/artifact
COPY --from=build /build/service/marketing/package.json /srv/service/marketing/package.json
COPY --from=build /build/service/marketing/tsconfig.json /srv/service/marketing/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/marketing
CMD [ "node", "service/marketing/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS navigation
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database /srv/library/database /srv/library/database
COPY --from=logger /srv/library/logger /srv/library/logger
COPY --from=middleware /srv/library/middleware /srv/library/middleware
COPY --from=service /srv/library/service /srv/library/service
COPY --from=uikit /srv/library/uikit /srv/library/uikit
COPY --from=utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/navigation/artifact /srv/service/navigation/artifact
COPY --from=build /build/service/navigation/package.json /srv/service/navigation/package.json
COPY --from=build /build/service/navigation/tsconfig.json /srv/service/navigation/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/navigation
CMD [ "node", "service/navigation/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS user
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database /srv/library/database /srv/library/database
COPY --from=logger /srv/library/logger /srv/library/logger
COPY --from=middleware /srv/library/middleware /srv/library/middleware
COPY --from=service /srv/library/service /srv/library/service
COPY --from=uikit /srv/library/uikit /srv/library/uikit
COPY --from=utility /srv/library/utility /srv/library/utility
COPY --from=build /build/database/authentication /srv/database/authentication
COPY --from=build /build/database/user /srv/database/user
COPY --from=build /build/service/user/artifact /srv/service/user/artifact
COPY --from=build /build/service/user/package.json /srv/service/user/package.json
COPY --from=build /build/service/user/tsconfig.json /srv/service/user/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/user
CMD [ "node", "service/user/artifact/serve.js" ]
