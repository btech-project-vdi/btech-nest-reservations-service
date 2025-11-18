FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app


COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install

COPY . .

EXPOSE 7006