import App from '../components/App'

const Index = () => (
    <App>
        <div>Hello World! <span className="wave">👋</span></div>

        <style jsx>{`
            .wave {
                font-size: 2em;
            }
        `}</style>
    </App>
)

export default Index