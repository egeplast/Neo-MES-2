FROM node:22-alpine AS build
ARG CONFIGURATION=production
WORKDIR /app
COPY ./mes-ext-2-frontend/package*.json ./mes-ext-2-frontend/
RUN cd mes-ext-2-frontend && npm ci
COPY ./libs ./libs
COPY ./mes-ext-2-frontend ./mes-ext-2-frontend
RUN cd mes-ext-2-frontend && npx ng build -c $c

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf && rm /etc/nginx/nginx.conf
COPY ./mes-ext-2-frontend/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./mes-ext-2-frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/mes-ext-2-frontend/dist/mes-ext-2-frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
