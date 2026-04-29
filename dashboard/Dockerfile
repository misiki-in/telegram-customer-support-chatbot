##### Stage 1 - Development - Generate dist folder
FROM oven/bun AS builder
LABEL author="Ayushman Tripathy"

ARG PUBLIC_API_ENDPOINT
ENV PUBLIC_API_ENDPOINT=${PUBLIC_API_ENDPOINT}

WORKDIR /usr/app
COPY package.json ./
ENV NODE_ENV=production
RUN bun install
COPY . .
RUN bun run build

##### Stage 2 - Production
FROM oven/bun AS production

WORKDIR /usr/app
COPY --from=builder /usr/app/build ./build
COPY --from=builder /usr/app/package.json ./
COPY --from=builder /usr/app/bun.lock ./

ENV NODE_ENV=production

CMD ["bun", "build/index.js"]
