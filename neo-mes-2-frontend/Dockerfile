FROM node:22-alpine AS build
ARG c=production
WORKDIR /app
COPY ./neo-mes-2-frontend/package*.json ./neo-mes-2-frontend/
RUN cd neo-mes-2-frontend && npm ci
COPY ./libs ./libs
COPY ./neo-mes-2-frontend ./neo-mes-2-frontend
RUN cd neo-mes-2-frontend && npx ng build -c $c

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf && rm /etc/nginx/nginx.conf
COPY ./neo-mes-2-frontend/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./neo-mes-2-frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/neo-mes-2-frontend/dist/neo-mes-2-frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
