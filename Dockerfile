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
  --from @tw050x.net.service/authorisation \
  --from @tw050x.net.service/error \
  --from @tw050x.net.service/marketing \
  --from @tw050x.net.service/navigation \
  --from @tw050x.net.service/portal \
  --from @tw050x.net.service/users \
  --from @tw050x.net.worker/sessions-events \
  --from @tw050x.net.worker/sessions-queue \
  --from @tw050x.net.worker/users-queue \
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

FROM node:23.11.1-alpine3.22 AS library
WORKDIR /srv
COPY --from=build /build/library/database/artifact /srv/library/database/artifact
COPY --from=build /build/library/database/package.json /srv/library/database/package.json
COPY --from=build /build/library/database/tsconfig.json /srv/library/database/tsconfig.json
COPY --from=build /build/library/platform/artifact /srv/library/platform/artifact
COPY --from=build /build/library/platform/package.json /srv/library/platform/package.json
COPY --from=build /build/library/platform/tsconfig.json /srv/library/platform/tsconfig.json
COPY --from=build /build/library/static/artifact /srv/library/static/artifact
COPY --from=build /build/library/static/package.json /srv/library/static/package.json
COPY --from=build /build/library/static/tsconfig.json /srv/library/static/tsconfig.json

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Services                                                  #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

FROM node:23.11.1-alpine3.22 AS assets
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=build /build/service/assets/public /srv/service/assets/public
COPY --from=build /build/service/assets/package.json /srv/service/assets/package.json
COPY --from=build /build/service/assets/serve.json /srv/service/assets/serve.json
RUN yarn workspaces focus --production @tw050x.net.service/assets --production
ENTRYPOINT [ "sh", "-c" ]
CMD [ "yarn workspace @tw050x.net.service/assets serve --config /srv/service/assets/serve.json --listen tcp://0.0.0.0:3000" ]

FROM node:23.11.1-alpine3.22 AS authorisation
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library /srv/library /srv/library
COPY --from=build /build/service/authorisation/artifact /srv/service/authorisation/artifact
COPY --from=build /build/service/authorisation/package.json /srv/service/authorisation/package.json
RUN yarn workspaces focus @tw050x.net.service/authorisation --production
CMD [ "node", "service/authorisation/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS error
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library /srv/library /srv/library
COPY --from=build /build/service/error/artifact /srv/service/error/artifact
COPY --from=build /build/service/error/package.json /srv/service/error/package.json
RUN yarn workspaces focus @tw050x.net.service/error --production
CMD [ "node", "service/error/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS marketing
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library /srv/library /srv/library
COPY --from=build /build/service/marketing/artifact /srv/service/marketing/artifact
COPY --from=build /build/service/marketing/package.json /srv/service/marketing/package.json
RUN yarn workspaces focus @tw050x.net.service/marketing --production
CMD [ "node", "service/marketing/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS navigation
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library /srv/library /srv/library
COPY --from=build /build/service/navigation/artifact /srv/service/navigation/artifact
COPY --from=build /build/service/navigation/package.json /srv/service/navigation/package.json
RUN yarn workspaces focus @tw050x.net.service/navigation --production
CMD [ "node", "service/navigation/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS portal
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library /srv/library /srv/library
COPY --from=build /build/service/portal/artifact /srv/service/portal/artifact
COPY --from=build /build/service/portal/package.json /srv/service/portal/package.json
RUN yarn workspaces focus @tw050x.net.service/portal --production
CMD [ "node", "service/portal/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS users
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library /srv/library /srv/library
COPY --from=build /build/service/users/artifact /srv/service/users/artifact
COPY --from=build /build/service/users/package.json /srv/service/users/package.json
RUN yarn workspaces focus @tw050x.net.service/users --production
CMD [ "node", "service/users/artifact/serve.js" ]

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Workers                                                   #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

FROM node:23.11.1-alpine3.22 AS sessions-queue
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library /srv/library /srv/library
COPY --from=build /build/worker/sessions-queue/artifact /srv/worker/sessions-queue/artifact
COPY --from=build /build/worker/sessions-queue/package.json /srv/worker/sessions-queue/package.json
RUN yarn workspaces focus @tw050x.net.worker/sessions-queue --production
CMD [ "node", "worker/sessions-queue/artifact/run.js" ]

FROM node:23.11.1-alpine3.22 AS sessions-scheduler
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library /srv/library /srv/library
COPY --from=build /build/worker/sessions-scheduler/artifact /srv/worker/sessions-scheduler/artifact
COPY --from=build /build/worker/sessions-scheduler/package.json /srv/worker/sessions-scheduler/package.json
RUN yarn workspaces focus @tw050x.net.worker/sessions-scheduler --production
CMD [ "node", "worker/sessions-scheduler/artifact/run.js" ]

FROM node:23.11.1-alpine3.22 AS users-queue
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library /srv/library /srv/library
COPY --from=build /build/worker/users-queue/artifact /srv/worker/users-queue/artifact
COPY --from=build /build/worker/users-queue/package.json /srv/worker/users-queue/package.json
RUN yarn workspaces focus @tw050x.net.worker/users-queue --production
CMD [ "node", "worker/users-queue/artifact/run.js" ]
