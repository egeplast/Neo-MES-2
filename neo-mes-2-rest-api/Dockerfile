FROM node:22-alpine AS build
WORKDIR /app
COPY ./neo-mes-2-rest-api/package*.json ./neo-mes-2-rest-api/
RUN cd neo-mes-2-rest-api && npm ci
COPY ./libs ./libs
COPY ./neo-mes-2-rest-api ./neo-mes-2-rest-api
RUN cd neo-mes-2-rest-api && npx prisma generate && npm run build

FROM node:22-alpine AS production
RUN apk add --no-cache dumb-init openssl
WORKDIR /app
COPY --from=build /app/neo-mes-2-rest-api/dist ./dist
COPY --from=build /app/neo-mes-2-rest-api/generated ./dist/neo-mes-2-rest-api/generated
COPY --from=build /app/neo-mes-2-rest-api/package*.json ./

RUN npm ci --omit=dev && npm cache clean --force
EXPOSE 80
CMD ["dumb-init", "node", "dist/neo-mes-2-rest-api/src/main.js"]

