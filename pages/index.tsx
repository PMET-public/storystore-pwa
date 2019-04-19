import React, { FunctionComponent } from 'react'
import App from '@app/containers/App'

const Index: FunctionComponent = () => (
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
