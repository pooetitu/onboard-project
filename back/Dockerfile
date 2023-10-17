FROM node:18 as build
WORKDIR /home
COPY package.json .
COPY package-lock.json .
RUN npm i

COPY dist/ /home/dist

EXPOSE 3000

ENV CONTRACT_CREATION_BLOCK=22069112
ENV DAILY_BLOCKS=28800
ENV LOG_BLOCKS=500000
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_NAME=postgres
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres

ENTRYPOINT node /home/dist/main.js
