FROM node:10.20.1-slim AS stage1

ENV MAGENTO_URL=https://venia.magento.com/graphql
ENV GOOGLE_ANALYTICS=UA-168656142-1
ENV DEMO_MODE=true

RUN mkdir -p /pwa

COPY . /pwa

WORKDIR /pwa

RUN npm install

RUN npx next telemetry disable

RUN npm run build

RUN npm prune --production

FROM node:10.20.1-slim

ENV MAGENTO_URL=https://venia.magento.com/graphql
ENV DEMO_MODE=true
ENV GOOGLE_ANALYTICS=UA-168656142-1
EXPOSE 3000

COPY --from=stage1 /pwa /pwa

WORKDIR /pwa

CMD ["npm", "start"]