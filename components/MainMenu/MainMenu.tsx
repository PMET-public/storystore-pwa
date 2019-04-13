import React, { FunctionComponent } from 'react'
import Link from 'next/link'

type Item = {
    name: string,
    url: string
    items?: Item[]
}

export type MainMenuProps = {
    items: Item[]
}

const List: FunctionComponent<{ items: Item[] }> = (({ items }) => (
    <ul className="main-menu__list">
        { items.map(({ name, url, items: subItems }) => (
            <li key={url} className="main-menu__list__item">
                <Link href={url}><a>{name}</a></Link>
                { subItems && <MainMenu items={subItems} /> }
            </li>
        )) }

        <style jsx>{`
            .main-menu__list {
                box-sizing: border-box;
                width: 100%;
                position: absolute;
                top: 0;
                display: flex;
                flex-direction: column;
                border: 1px dashed red;
                list-style: none;
                margin: 0;
                padding: 2rem;
            }

            .main-menu__list__item {
                display: flex;
                flex-direction: row;
            }
        `}</style>
    </ul>
))


const MainMenu: FunctionComponent<MainMenuProps> = ({ items }) => (
    <nav className="main-menu">
        { items && <List items={items} /> }
    </nav>
)

export default MainMenu