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
RUN yarn workspaces focus @tw050x.net/assets

## Build the project
RUN yarn workspace @tw050x.net/assets run css:compile

FROM node:23.11.1-alpine3.22 AS assets
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=build /build/.yarn /srv/.yarn
COPY --from=build /build/.pnp.cjs /srv/.pnp.cjs
COPY --from=build /build/.yarnrc.yml /srv/.yarnrc.yml
COPY --from=build /build/package.json /srv/package.json
COPY --from=build /build/yarn.lock /srv/yarn.lock
COPY --from=build /build/assets/public /srv/assets/public
COPY --from=build /build/assets/package.json /srv/assets/package.json
COPY --from=build /build/assets/tsconfig.json /srv/assets/tsconfig.json
COPY --from=build /build/assets/serve.json /srv/assets/serve.json
RUN yarn workspaces focus --production @tw050x.net/assets
ENTRYPOINT [ "sh", "-c" ]
CMD [ "yarn workspace @tw050x.net/assets serve --config /srv/assets/serve.json --listen tcp://0.0.0.0:3000" ]
