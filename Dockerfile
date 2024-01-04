# Builder Stage
FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY ./src ./src
COPY tsconfig.json .
COPY nest-cli.json .
RUN npm run build

# Runner Stage
FROM node:20-alpine as runner
WORKDIR /app
COPY .env.example .env
COPY ./public /app/public
COPY ./views /app/views
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE $LISTEN_PORT
CMD ["node", "dist/main.js"]
