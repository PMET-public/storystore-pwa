declare namespace NodeJS {
    interface ProcessEnv {
        MAGENTO_URL: string
        GOOGLE_ANALYTICS: string
        CLOUD_MODE: string
        PROCESS_IMAGES: string

        LATEST_RELEASE_REDIRECT_URL?: string
        PREV_RELEASE_REDIRECT_URL?: string
    }
}
