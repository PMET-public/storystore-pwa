import React from 'react'
import { getClassNamesWithModifier } from '../lib/helpers'


const FlashMessage = ({ message, type, onClose = () => {} }) => (
    <div className={getClassNamesWithModifier('app-flash-message', type)}>
        {message}

        <button type="button" onClick={onClose}>Close</button>

        <style jsx>{`
            .app-flash-message {
                background-color: var(--color-primary);
                color: var(--color-primary--text);
                font-size: 1.5rem;
                left: 0;
                padding: 1rem;
                position: fixed;
                right: 0;
                top: 0;
            }

            .app-flash-message--error {
                background-color: var(--color-error);
                color: var(--color-error--contrast);
            }

            .app-flash-message--warning {
                background-color: var(--color-warning);
                color: var(--color-warning--contrast);
            }
        `}</style>
    </div>
)

export default FlashMessage