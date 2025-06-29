# BUILD STAGE
FROM node:22-slim AS build

RUN npm install -g pnpm

WORKDIR /app/cv_builder

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]
