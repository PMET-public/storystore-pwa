import { useQuery } from '@apollo/client'

import PRODUCTS_QUERY from './graphql/products.graphql'

export const useProducts = ({ skus }: { skus: string[] }) => {
    const query = useQuery(PRODUCTS_QUERY, {
        variables: { skus, pageSize: skus.length },
    })

    return {
        ...query,
    }
}
