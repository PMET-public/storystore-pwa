export enum COOKIE {
    settings = 'SETTINGS_OVERRIDES',
    cartId = 'STORE_CART-ID',
}

export const setCookie = (name: string, value: string, expirationDays: number) => {
    const date = new Date()
    date.setTime(date.getTime() + expirationDays * 24 * 60 * 60 * 1000)
    const expires = 'expires=' + date.toUTCString()
    document.cookie = name + '=' + value + ';' + expires + ';path=/'
}

export const getCookieValueFromString = (cookie: string, name: string) => {
    if (!cookie) return null
    const regex = cookie.match(new RegExp(name + '=([^;]+)'))
    return regex ? regex[1] : null
}

export const getCookie = (name: string, cookie?: string) => {
    return getCookieValueFromString(process.browser ? cookie || document.cookie : cookie || '', name)
}

export const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}
