FROM node:10.20.1-slim AS stage1

ENV http://pwa-cloud.storystore.dev/api/graphql
ENV GOOGLE_ANALYTICS=UA-168656142-1
ENV CLOUD_MODE=true
ENV PROCESS_IMAGES=true

RUN mkdir -p /pwa

COPY . /pwa

WORKDIR /pwa

RUN npm install

RUN npx next telemetry disable

RUN npm run build

RUN npm prune --production

FROM node:10.20.1-slim

ENV http://pwa-cloud.storystore.dev/api/graphql
ENV CLOUD_MODE=true
ENV GOOGLE_ANALYTICS=UA-168656142-1
ENV PROCESS_IMAGES=true
EXPOSE 3000

COPY --from=stage1 /pwa /pwa

WORKDIR /pwa

CMD ["npm", "start"]
