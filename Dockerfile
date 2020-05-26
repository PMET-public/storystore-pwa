FROM node:10.20.1-slim AS stage1

ENV MAGENTO_URL=https://venia.magento.com/graphql
ENV HOME_PAGE_ID=home-luma-ui
ENV DEMO_MODE=true
EXPOSE 3000

RUN mkdir -p /pwa

COPY . /pwa

WORKDIR /pwa

RUN npm install

RUN npx next telemetry disable

RUN npm run build

RUN apt-cache pkgnames | grep '\-dev$' | xargs apt-get -y autoremove

RUN rm -rf /var/lib/apt/lists/*

FROM node:10.20.1-slim

ENV MAGENTO_URL=https://venia.magento.com/graphql
ENV HOME_PAGE_ID=home-luma-ui
ENV DEMO_MODE=true
EXPOSE 3000

COPY --from=stage1 /pwa /pwa

WORKDIR /pwa

CMD ["npm", "start"]