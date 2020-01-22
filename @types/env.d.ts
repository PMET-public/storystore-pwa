declare module NodeJS {
    interface ProcessEnv {
        mode: string
        magentoUrl: string
        magentoGraphQlUrl: string
        homePageId: string
        categoryParentId: string
        footerBlockId: string
    }
}
