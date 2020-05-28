export const getURLSearchAsObject = () => {
    return location.search
        ? location.search
              .slice(1)
              .split('&')
              .map(p => p.split('='))
              .reduce((obj, [key, value]) => ({ ...obj, [key]: decodeURIComponent(value) }), {})
        : {}
}
