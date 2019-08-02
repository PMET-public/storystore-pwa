import React, { FunctionComponent } from 'react'

type CMSPageProps = {
    id: number
}

const CMSPage: FunctionComponent<CMSPageProps> = ({ id }) => {
    
    return (
        <div>
            template: cms_page <br/>
            id: {id}
        </div>
    )
}

export default CMSPage
