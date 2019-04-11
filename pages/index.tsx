import React from 'react'
import { NextFunctionComponent } from 'next'
import App from '@luma/containers/App'

const Index: NextFunctionComponent = () => (
    <App>
        <div className="title">
            <span className="wave">👋🌍</span>
        </div>

        <style jsx>{`
            .title {
                font-size: 20vw;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `}</style>
    </App>
)

export default Index
