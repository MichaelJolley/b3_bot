FROM node:12.6.0-alpine

WORKDIR /app/shared

COPY ./shared/package*.json ./
RUN npm ci --silent

COPY ./shared/ ./
RUN npm version $BUILDVERSION --allow-same-version \
  && npm run build

WORKDIR /app/hub

COPY ./hub/package*.json ./
RUN npm ci --silent

COPY ./hub/ ./
RUN npm version $BUILDVERSION --allow-same-version \
  && npm run build

EXPOSE 80
CMD [ "node", "dist/index.js" ]
