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
export const getClassNamesWithModifier = (className: string, ...modifiers: (string|[string, boolean])[]) => {
    const _modifiers = modifiers
        .filter(m => m.length > 1 ? m[1] : !!m)
        .map(m => `${className}--${typeof m === 'string' ? m : m[0]}`)
    
    return [ className, ..._modifiers ].join(' ') 
}
