import { useRef, useEffect } from 'react'

export const useValueUpdated = (callback: (...args: any) => any, value: any) => {
    const ref = useRef()

    useEffect(() => {
        if (value !== ref.current) callback()
        ref.current = value
    }, [value, callback])

    return ref.current
}
