type Keys = 'cartId'

export const getFromLocalStorage = (key: Keys) => localStorage.getItem(`storystore/${key}`)

export const removeFromLocalStorage = (key: Keys) => localStorage.removeItem(`storystore/${key}`)

export const writeInLocalStorage = (key: Keys, value: string) => localStorage.setItem(`storystore/${key}`, value)
