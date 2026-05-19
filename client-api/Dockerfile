FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

RUN npx playwright install --with-deps chromium

EXPOSE 5000

CMD ["npm", "run", "start"]