import React, { FunctionComponent } from 'react'
import App from '@app/containers/App'

const Index: FunctionComponent = () => (
    <App>
        <div className="title">
            <span className="wave">👋🌍</span>
        </div>

        <style jsx>{`
            .title {
                font-size: 4rem;
            }
        `}</style>
    </App>
)

export default Index
