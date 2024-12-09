# Backend Dockerfile
FROM node:16-alpine

WORKDIR /usr/src/app

COPY package.json package-logck.json ./ 

RUN npm install 

COPY index.js . 

EXPOSE 5000

CMD ["node", "index.js"]
