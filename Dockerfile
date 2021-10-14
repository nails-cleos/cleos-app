### STAGE 1: Build ###
FROM node:14.17-alpine as build
ARG BUILD

WORKDIR /usr/src/app

ENV PATH=${PATH}:./node_modules/.bin
ENV NODE_PATH=/usr/src/app/node_modules

ADD package.json ./
ADD package-lock.json ./

RUN npm ci
RUN ngcc

ADD . .

RUN if [[ -z "$BUILD_CONFIG" ]] ; then BUILD_CONFIG=--configuration=production ; fi

RUN npm run build $BUILD_CONFIG

### STAGE 2: Deploy ###
FROM nginx:1.17.1-alpine as nginx
ARG NGINX

COPY ${NGINX} /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/cleos /usr/share/nginx/html

EXPOSE 80
EXPOSE 443
# Start
CMD ["nginx", "-g", "daemon off;"]
