import React, { FunctionComponent } from 'react'

type CategoryProps = {
    id: number
}

const Category: FunctionComponent<CategoryProps> = ({ id }) => {
    
    return (
        <div>
            template: category <br/>
            id: {id}
        </div>
    )
}
export default Category
