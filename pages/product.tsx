import React, { FunctionComponent } from 'react'

type ProductProps = {
    id: number
}

const Product: FunctionComponent<ProductProps> = ({ id }) => {
    
    return (
        <div>
            template: product <br/>
            id: {id}
        </div>
    )
}

export default Product
