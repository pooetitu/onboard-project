FROM caddy:alpine

EXPOSE 80
EXPOSE 443
VOLUME /data

COPY ./Caddyfile /etc/caddy/Caddyfile
COPY ./build /usr/share/caddy/