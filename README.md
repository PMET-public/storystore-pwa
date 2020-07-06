![package.json version](https://img.shields.io/github/package-json/v/pmet-public/storystore-pwa/master)
![CI badge](https://github.com/PMET-public/storystore-pwa/workflows/CI%20with%20Lighthouse/badge.svg?branch=master)
![Docker badge](https://github.com/PMET-public/storystore-pwa/workflows/build%20and%20publish%20to%20Docker%20Hub/badge.svg?branch=master)

# StoryStore PWA

https://pwa.storystore.dev

## Versions


### 📍 v1.1 (Current)

https://github.com/PMET-public/storystore-pwa/milestone/1

#### Requirements:

-   Magento Commerce 2.3.5

### v1.0

#### Requirements:

-   Magento Commerce 2.3.4

## CI/CD

Google's [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci/blob/master/docs/getting-started.md#github-app-method-recommended) app runs a battery of PWA audits, performance tests, etc. on every commit, reports the results in GitHub Status checks, and is highly [configurable](https://github.com/GoogleChrome/lighthouse/blob/master/docs/configuration.md). Lighthouse CI tests against the app directly and via a performance enhancing [reverse proxy](https://github.com/PMET-public/docker-nginx-with-pagespeed) using Google's [PageSpeed](https://developers.google.com/speed/pagespeed/module/) module.

Each commit is also tested and optionally published to the [Docker hub](https://hub.docker.com/repository/docker/pmetpublic/storystore-pwa) based on the GitHub [docker-publish](https://github.com/actions/starter-workflows/blob/master/ci/docker-publish.yml) workflow.
