FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine

RUN mkdir -p /usr/share/nginx/html
COPY --from=build /app/dist/mcabank-frontend/browser/ /usr/share/nginx/html/

# Replace default Nginx config
RUN rm /etc/nginx/conf.d/default.conf
COPY ./Infrastructure/Docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
