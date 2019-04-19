/**
 * Returns full page title
 * @param {*} arr 
 */
export const getFullPageTitle = (arr: string[]) => arr.filter(x => !!x).join(' | ')