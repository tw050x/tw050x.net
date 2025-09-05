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
  --from @tw050x.net/administration-service \
  --from @tw050x.net/authentication-service \
  --from @tw050x.net/error-service \
  --from @tw050x.net/marketing-service \
  --from @tw050x.net/navigation-service \
  --from @tw050x.net/user-service \
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

FROM node:23.11.1-alpine3.22 AS database-library
WORKDIR /srv
COPY --from=build /build/library/database-library/artifact /srv/library/database-library/artifact
COPY --from=build /build/library/database-library/package.json /srv/library/database-library/package.json
COPY --from=build /build/library/database-library/tsconfig.json /srv/library/database-library/tsconfig.json

FROM node:23.11.1-alpine3.22 AS logger-library
WORKDIR /srv
COPY --from=build /build/library/logger-library/artifact /srv/library/logger-library/artifact
COPY --from=build /build/library/logger-library/package.json /srv/library/logger-library/package.json
COPY --from=build /build/library/logger-library/tsconfig.json /srv/library/logger-library/tsconfig.json

FROM node:23.11.1-alpine3.22 AS middleware-library
WORKDIR /srv
COPY --from=build /build/library/middleware-library/artifact /srv/library/middleware-library/artifact
COPY --from=build /build/library/middleware-library/package.json /srv/library/middleware-library/package.json
COPY --from=build /build/library/middleware-library/tsconfig.json /srv/library/middleware-library/tsconfig.json

FROM node:23.11.1-alpine3.22 AS service-library
WORKDIR /srv
COPY --from=build /build/library/service-library/artifact /srv/library/service-library/artifact
COPY --from=build /build/library/service-library/package.json /srv/library/service-library/package.json
COPY --from=build /build/library/service-library/tsconfig.json /srv/library/service-library/tsconfig.json

FROM node:23.11.1-alpine3.22 AS uikit-library
WORKDIR /srv
COPY --from=build /build/library/uikit-library/artifact /srv/library/uikit-library/artifact
COPY --from=build /build/library/uikit-library/package.json /srv/library/uikit-library/package.json
COPY --from=build /build/library/uikit-library/tsconfig.json /srv/library/uikit-library/tsconfig.json

FROM node:23.11.1-alpine3.22 AS utility-library
WORKDIR /srv
COPY --from=build /build/library/utility-library/artifact /srv/library/utility-library/artifact
COPY --from=build /build/library/utility-library/package.json /srv/library/utility-library/package.json
COPY --from=build /build/library/utility-library/tsconfig.json /srv/library/utility-library/tsconfig.json

FROM node:23.11.1-alpine3.22 AS administration-service
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-library /srv/library/database-library /srv/library/database-library
COPY --from=logger-library /srv/library/logger-library /srv/library/logger-library
COPY --from=middleware-library /srv/library/middleware-library /srv/library/middleware-library
COPY --from=service-library /srv/library/service-library /srv/library/service-library
COPY --from=uikit-library /srv/library/uikit-library /srv/library/uikit-library
COPY --from=utility-library /srv/library/utility-library /srv/library/utility-library
COPY --from=build /build/service/administration-service/artifact /srv/service/administration-service/artifact
COPY --from=build /build/service/administration-service/package.json /srv/service/administration-service/package.json
COPY --from=build /build/service/administration-service/tsconfig.json /srv/service/administration-service/tsconfig.json
RUN yarn workspaces focus @tw050x.net/administration-service
CMD [ "node", "service/administration-service/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS assets-service
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=build /build/service/assets-service/public /srv/service/assets-service/public
COPY --from=build /build/service/assets-service/package.json /srv/service/assets-service/package.json
COPY --from=build /build/service/assets-service/tsconfig.json /srv/service/assets-service/tsconfig.json
COPY --from=build /build/service/assets-service/serve.json /srv/service/assets-service/serve.json
RUN yarn workspaces focus --production @tw050x.net/assets-service
ENTRYPOINT [ "sh", "-c" ]
CMD [ "yarn workspace @tw050x.net/assets-service serve --config /srv/service/assets-service/serve.json --listen tcp://0.0.0.0:3000" ]

FROM node:23.11.1-alpine3.22 AS authentication-service
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-library /srv/library/database-library /srv/library/database-library
COPY --from=logger-library /srv/library/logger-library /srv/library/logger-library
COPY --from=middleware-library /srv/library/middleware-library /srv/library/middleware-library
COPY --from=service-library /srv/library/service-library /srv/library/service-library
COPY --from=uikit-library /srv/library/uikit-library /srv/library/uikit-library
COPY --from=utility-library /srv/library/utility-library /srv/library/utility-library
COPY --from=build /build/database/authentication-database /srv/database/authentication-database
COPY --from=build /build/service/authentication-service/artifact /srv/service/authentication-service/artifact
COPY --from=build /build/service/authentication-service/package.json /srv/service/authentication-service/package.json
COPY --from=build /build/service/authentication-service/tsconfig.json /srv/service/authentication-service/tsconfig.json
RUN yarn workspaces focus @tw050x.net/authentication-service
CMD [ "node", "service/authentication-service/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS error-service
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=logger-library /srv/library/logger-library /srv/library/logger-library
COPY --from=middleware-library /srv/library/middleware-library /srv/library/middleware-library
COPY --from=service-library /srv/library/service-library /srv/library/service-library
COPY --from=uikit-library /srv/library/uikit-library /srv/library/uikit-library
COPY --from=utility-library /srv/library/utility-library /srv/library/utility-library
COPY --from=build /build/service/error-service/artifact /srv/service/error-service/artifact
COPY --from=build /build/service/error-service/package.json /srv/service/error-service/package.json
COPY --from=build /build/service/error-service/tsconfig.json /srv/service/error-service/tsconfig.json
RUN yarn workspaces focus @tw050x.net/error-service
CMD [ "node", "service/error-service/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS marketing-service
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-library /srv/library/database-library /srv/library/database-library
COPY --from=logger-library /srv/library/logger-library /srv/library/logger-library
COPY --from=middleware-library /srv/library/middleware-library /srv/library/middleware-library
COPY --from=service-library /srv/library/service-library /srv/library/service-library
COPY --from=uikit-library /srv/library/uikit-library /srv/library/uikit-library
COPY --from=utility-library /srv/library/utility-library /srv/library/utility-library
COPY --from=build /build/service/marketing-service/artifact /srv/service/marketing-service/artifact
COPY --from=build /build/service/marketing-service/package.json /srv/service/marketing-service/package.json
COPY --from=build /build/service/marketing-service/tsconfig.json /srv/service/marketing-service/tsconfig.json
RUN yarn workspaces focus @tw050x.net/marketing-service
CMD [ "node", "service/marketing-service/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS navigation-service
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-library /srv/library/database-library /srv/library/database-library
COPY --from=logger-library /srv/library/logger-library /srv/library/logger-library
COPY --from=middleware-library /srv/library/middleware-library /srv/library/middleware-library
COPY --from=service-library /srv/library/service-library /srv/library/service-library
COPY --from=uikit-library /srv/library/uikit-library /srv/library/uikit-library
COPY --from=utility-library /srv/library/utility-library /srv/library/utility-library
COPY --from=build /build/service/navigation-service/artifact /srv/service/navigation-service/artifact
COPY --from=build /build/service/navigation-service/package.json /srv/service/navigation-service/package.json
COPY --from=build /build/service/navigation-service/tsconfig.json /srv/service/navigation-service/tsconfig.json
RUN yarn workspaces focus @tw050x.net/navigation-service
CMD [ "node", "service/navigation-service/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS user-service
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-library /srv/library/database-library /srv/library/database-library
COPY --from=logger-library /srv/library/logger-library /srv/library/logger-library
COPY --from=middleware-library /srv/library/middleware-library /srv/library/middleware-library
COPY --from=service-library /srv/library/service-library /srv/library/service-library
COPY --from=uikit-library /srv/library/uikit-library /srv/library/uikit-library
COPY --from=utility-library /srv/library/utility-library /srv/library/utility-library
COPY --from=build /build/database/authentication-database /srv/database/authentication-database
COPY --from=build /build/service/user-service/artifact /srv/service/user-service/artifact
COPY --from=build /build/service/user-service/package.json /srv/service/user-service/package.json
COPY --from=build /build/service/user-service/tsconfig.json /srv/service/user-service/tsconfig.json
RUN yarn workspaces focus @tw050x.net/user-service
CMD [ "node", "service/user-service/artifact/serve.js" ]
