# # ### STAGE 1: Production Environment - Node###
FROM node:10.15.0
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD [ "node", "index.js" ]