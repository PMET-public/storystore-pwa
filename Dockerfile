FROM node:10.20.1

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

CMD ["npm", "start"]

