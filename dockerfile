FROM node:18
WORKDIR /app
COPY . .
COPY package*.json ./
RUN npm install --production
EXPOSE 5500
CMD ["node", "script.js"]