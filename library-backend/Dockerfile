FROM node:24-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

USER node

CMD ["npm", "start"]
