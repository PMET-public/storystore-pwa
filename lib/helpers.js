/**
 * Returns full page title
 * @param {*} arr 
 */
export const getFullPageTitle = (arr) => arr.filter(x => !!x).join(' | ')

/**
 * Returns a string with the all classes
 * @param {*} type 
 * @param {*} modifier 
 */

 /**
  * Returns a string with the all classes
  * i.e.: class-name
  * @param {*} className 
  * @param  {...any} modifiers 
  */

export const getClassNamesWithModifier = (className, ...modifiers) => {
    const _modifiers= modifiers
        .filter(m =>!!m)
        .map(m => `${className}--${m}`)
    
    return [ className, ..._modifiers ].join(' ') 
}
