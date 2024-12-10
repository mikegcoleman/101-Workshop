# Backend Dockerfile
FROM node:16-alpine

WORKDIR /usr/src/app

COPY . . 

RUN npm install  

EXPOSE 5000

CMD ["node", "index.js"]
