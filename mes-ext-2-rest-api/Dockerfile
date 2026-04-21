FROM node:22-alpine AS build
WORKDIR /app
COPY ./mes-ext-2-rest-api/package*.json ./mes-ext-2-rest-api/
RUN cd mes-ext-2-rest-api && npm ci
COPY ./libs ./libs
COPY ./mes-ext-2-rest-api ./mes-ext-2-rest-api
RUN cd mes-ext-2-rest-api && npx prisma generate && npm run build

FROM node:22-alpine AS production
RUN apk add --no-cache dumb-init openssl
WORKDIR /app
COPY --from=build /app/mes-ext-2-rest-api/dist ./dist
COPY --from=build /app/mes-ext-2-rest-api/generated ./generated
COPY --from=build /app/mes-ext-2-rest-api/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
EXPOSE 80
CMD ["dumb-init", "node", "dist/src/main.js"]
