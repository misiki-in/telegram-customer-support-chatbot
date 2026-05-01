##### Stage 1 - Development - Generate dist folder
FROM oven/bun AS builder
LABEL author="Ayushman Tripathy"

WORKDIR /usr/app
COPY package.json ./
ENV NODE_ENV=production
RUN bun install
COPY . .
RUN sh build-script.sh
RUN bun run build

##### Stage 2 - Production
FROM oven/bun AS production

WORKDIR /usr/app
COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/public ./public
COPY --from=builder /usr/app/package.json ./
COPY --from=builder /usr/app/bun.lock ./

ENV NODE_ENV=production

CMD ["bun", "dist/server.js"]

