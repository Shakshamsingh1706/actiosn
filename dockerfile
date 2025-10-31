FROM nginx:alpine

# Copy all website files to Nginx's default web directory
COPY . /usr/share/nginx/html

EXPOSE 5500
