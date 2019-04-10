/**
 * Returns full page title
 * @param {*} arr 
 */
export const getFullPageTitle = (arr: string[]) => arr.filter(x => !!x).join(' | ')

 /**
  * Returns a string with all classes
  * i.e.: class-name
  * @param {*} className 
  * @param  {...any} modifiers 
  */

export const getClassNamesWithModifier = (className: string, ...modifiers: string[]) => {
    const _modifiers= modifiers
        .filter(m =>!!m)
        .map(m => `${className}--${m}`)
    
    return [ className, ..._modifiers ].join(' ') 
}
