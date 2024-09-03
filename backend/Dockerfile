
FROM node:18-alpine as build 

WORKDIR /app

COPY package*.json ./

RUN npm i --silent 

RUN apk update && apk add --no-cache mysql-client

COPY . .


EXPOSE 5000


CMD ["npm", "run", "dev"]
