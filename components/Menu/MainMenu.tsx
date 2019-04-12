import React, { FunctionComponent } from 'react'
import { getClassNamesWithModifier } from '@luma/lib/helpers';

type MenuProps = {
    isOpen?: boolean
}

const Menu: FunctionComponent<MenuProps> = ({ isOpen = true }) => (
    <nav className={getClassNamesWithModifier('menu', (isOpen ? 'open' : ''))}>

        <ul >

        </ul>

        <style jsx>{`
            .menu {
                background: var(--color-white, #fff);
                box-shadow: 0 0.4rem 0.4rem rgba(0, 0, 0, .25);
                display: flex;
                height: 100%;
                height: 100%;
                left: 0;
                max-width: 20rem;
                padding: 1em;
                position: fixed;
                top: 0;
                transform: translateX(-100%);
                transition-duration: 192ms;
                transition-property: opacity, transform, visibility;
                transition-timing-function: cubic-bezier(.4, 0, 1, 1);
                visibility: hidden;
                width: 100%;
                z-index: 1;
            }
            .menu--open {
                transform: translateX(0);
                transition-duration: 224ms;
                transition-timing-function: cubic-bezier(0, 0, .2, 1);
                visibility: visible;
            }
        `}</style>
    </nav>
)

export default Menu