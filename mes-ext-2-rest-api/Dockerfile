FROM node:22-alpine AS build
WORKDIR /app
COPY ./Neo-MES-2-rest-api/package*.json ./Neo-MES-2-rest-api/
RUN cd Neo-MES-2-rest-api && npm ci
COPY ./libs ./libs
COPY ./Neo-MES-2-rest-api ./Neo-MES-2-rest-api
RUN cd Neo-MES-2-rest-api && npx prisma generate && npm run build

FROM node:22-alpine AS production
RUN apk add --no-cache dumb-init openssl
WORKDIR /app
COPY --from=build /app/Neo-MES-2-rest-api/dist ./dist
COPY --from=build /app/Neo-MES-2-rest-api/generated ./generNeo-MES-2
COPY --from=build /app/Neo-MES-2-rest-api/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
EXPOSE 80
CMD ["dumb-init", "node", "dist/src/main.js"]
Neo-MES-2