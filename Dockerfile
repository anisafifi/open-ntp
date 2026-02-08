FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN corepack enable && pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN apk add --no-cache chrony tzdata

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

COPY ./chrony/chrony.conf /etc/chrony/chrony.conf
COPY ./start.sh /start.sh

RUN mkdir -p /var/lib/chrony /var/run/chrony /var/log/chrony && \
	chown -R chrony:chrony /var/lib/chrony /var/run/chrony /var/log/chrony && \
	chmod +x /start.sh

EXPOSE 3000
EXPOSE 123/udp

CMD ["/start.sh"]
