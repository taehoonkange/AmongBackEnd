# syntax=docker/dockerfile:1

FROM node:16-alpine
ENV NODE_ENV=production
RUN mkdir -p ./among/back
WORKDIR ./among/back
COPY ["package.json", "package-lock.json*", "./"]
RUN yarn

COPY . .

CMD [ "yarn", "start" ]
