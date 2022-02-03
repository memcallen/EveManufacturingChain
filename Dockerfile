FROM node:current-alpine

WORKDIR /opt/web

ENTRYPOINT [ "sh", "entrypoint.sh" ]
