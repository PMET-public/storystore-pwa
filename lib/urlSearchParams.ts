export const setURLSearchParams = (values: { [key: string]: string }) => {
    if (!window.history.pushState) {
        return
    }

    const url = new URL(window.location.href)

    const params = new window.URLSearchParams(window.location.search)

    Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            params.delete(key)
        } else {
            params.set(key, value)
        }
    })

    url.search = params.toString()

    history.pushState(null, '', url.toString())
}

export const getURLSearchParams = () => {
    return location.search
        ? location.search
              .slice(1)
              .split('&')
              .map(p => p.split('='))
              .reduce((obj, [key, value]) => ({ ...obj, [key]: decodeURIComponent(value) }), {})
        : {}
}
