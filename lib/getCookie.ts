export const getCookie = (cookie: string, name: string) => {
    const regex = cookie.match(new RegExp(name + '=([^;]+)'))
    return regex ? regex[1] : null
}
