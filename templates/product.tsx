import React, { FunctionComponent } from 'react'
import gql from 'graphql-tag'

import { useQuery } from '@apollo/react-hooks'

import DocumentMetadata from '../components/DocumentMetadata'
import Error from 'next/error'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import ProductTemplate from 'luma-ui/dist/templates/Product'
import Link from '../components/Link'

type ProductProps = {
    id: number
}

const PRODUCT_QUERY = gql`
    query ProductQuery {
        products(filter: { sku: { eq: "WT09" } }, pageSize: 1) {
            items {
                id
                title: name
                categories {
                    id
                    text: name
                    href: url_path
                }
                sku
                price {
                    regularPrice {
                        amount {
                            currency
                            value
                        }
                    }
                }

                ... on ConfigurableProduct {
                    options: configurable_options {
                        id
                        label
                        # attribute_code
                        # attribute_id
                        items: values {
                            label
                            #     store_label
                            #     use_default_value
                            value: value_index
                        }
                    }
                    # variants {
                    #     attributes {
                    #         code
                    #         value_index
                    #     }
                    #     product {
                    #         id
                    #         media_gallery_entries {
                    #             disabled
                    #             file
                    #             label
                    #             position
                    #         }
                    #         sku
                    #         stock_status
                    #     }
                    # }
                }

                images: media_gallery_entries {
                    id
                    file
                    label
                    disabled
                    type: media_type
                }

                description: short_description {
                    html
                }

                pageBuilder: description {
                    html
                }

                metaDescription: meta_description
                metaKeywords: meta_keyword
                metaTitle: meta_title
            }
        }
        store: storeConfig {
            id
            titlePrefix: title_prefix
            titleSuffix: title_suffix
            baseMediaUrl: base_media_url
        }
    }
`

const Product: FunctionComponent<ProductProps> = ({ id }) => {
    const { loading, error, data } = useQuery(PRODUCT_QUERY, {
        variables: { id },
        fetchPolicy: 'cache-first',
    })

    if (loading) {
        return <ViewLoader />
    }

    if (error) {
        console.error(error.message)
        return <Error statusCode={500} />
    }

    if (!(data.products && data.products.items[0])) {
        return <Error statusCode={404} />
    }

    const { products, store } = data

    const [product] = products.items

    return (
        <React.Fragment>
            <DocumentMetadata
                title={[store.titlePrefix, product.metaTitle || product.title, store.titleSuffix]}
                description={product.metaDescription}
                keywords={product.metaKeywords}
            />

            <ProductTemplate
                title={{
                    text: product.title,
                }}
                sku={{
                    text: `SKU. ${product.sku}`,
                }}
                categories={
                    product.categories && {
                        items: product.categories
                            .slice(0, 4) // limit to 3
                            .filter((x: any) => !!x.href)
                            .map(({ id, text, href }: any) => ({
                                _id: id,
                                as: Link,
                                urlResolver: true,
                                href: '/' + href,
                                text,
                            })),
                    }
                }
                images={
                    product.images &&
                    product.images
                        .filter((x: any) => x.disabled === false && x.type === 'image')
                        .map(({ id, label, file }: any) => ({
                            _id: id,
                            alt: label,
                            src: store.baseMediaUrl + 'catalog/product' + file,
                        }))
                }
                price={{
                    regular: product.price.regularPrice.amount.value,
                    currency: product.price.regularPrice.amount.currency,
                }}
                buttons={[{ as: 'button', text: 'Add to Cart', disabled: true }]}
                description={product.description && product.description.html}
                pageBuilder={
                    product.pageBuilder && {
                        html: product.pageBuilder.html,
                    }
                }
                swatches={
                    product.options &&
                    product.options.map(({ id, label, items }: any) => ({
                        _id: id,
                        type: 'text',
                        title: {
                            text: label,
                        },
                        props: {
                            items: items.map(({ label }: any) => ({
                                text: label,
                            })),
                        },
                    }))
                }
            />
        </React.Fragment>
    )
}

export default Product
