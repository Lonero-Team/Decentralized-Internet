FROM node:21

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

EXPOSE 3000
EXPOSE 1883

CMD ["npm", "run", "start"]