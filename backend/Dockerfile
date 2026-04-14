FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY prisma ./prisma
COPY src ./src
COPY docs ./docs
COPY tsconfig.json ./
RUN npx prisma generate
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=build /app/build ./build
COPY --from=build /app/docs ./docs
EXPOSE 3555
CMD ["node", "build/app.js"]
