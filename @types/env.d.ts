declare namespace NodeJS {
    interface ProcessEnv {
        MAGENTO_URL: string
        GOOGLE_ANALYTICS: string
        DEMO_MODE: string

        LATEST_RELEASE_REDIRECT_URL: string
        PREV_RELEASE_REDIRECT_URL: string
    }
}
