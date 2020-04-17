import { toCamelCase } from '@pmet-public/luma-ui/src/lib'

/**
 * Styles as CSS Object
 */
export const getStyleAsObject = (style: CSSStyleDeclaration) => {
    const output: any = {}
    for (let i = 0; i < style.length; i++) {
        const name = style[i]
        const value = style.getPropertyValue(name)
        output[toCamelCase(name)] = value
    }
    return output
}
