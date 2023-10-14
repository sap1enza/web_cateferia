FROM node:18.18.0-alpine3.17

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN rm package-lock.json

RUN npm install cors

EXPOSE 3000
CMD ["npm", "run", "dev"]
