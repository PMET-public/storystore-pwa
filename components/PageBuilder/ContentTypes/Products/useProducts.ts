import { queryDefaultOptions } from '../../../../lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import PRODUCTS_QUERY from './graphql/products.graphql'

export const useProducts = ({ skus }: { skus: string[] }) => {
    const query = useQuery(PRODUCTS_QUERY, {
        ...queryDefaultOptions,
        variables: { skus, pageSize: skus.length },
    })

    return {
        ...query,
    }
}
