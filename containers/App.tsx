import React, { FunctionComponent, Fragment } from 'react'
import { gql } from 'apollo-boost'
import { Query } from 'react-apollo'
import { getFullPageTitle } from '@app/lib/helpers'
import { DocumentMetadataProps } from '@app/components/DocumentMetadata'
import DocumentMetadata from '@app/components/DocumentMetadata'
import { HotSpot, HotSpotContainer } from '../../luma-storybook/dist/components/HotSpots'

const APP_SHELL_QUERY = gql`
    query AppShellQuery {
        flashMessage @client { 
            type
            message
        }
        storeConfig {
            default_description
            default_keywords
            default_title
            title_prefix
            title_suffix
        }
    }
`

const App: FunctionComponent<any> = ({ children, ...rest }) => (
    <Query query={APP_SHELL_QUERY} fetchPolicy="cache-first" errorPolicy="all">
        {({ loading, data: {
            // flashMessage,
            storeConfig: {
                title_prefix,
                title_suffix,
                default_title,
                default_description,
                default_keywords,
            }
        } }: any) => {
            const metadata: DocumentMetadataProps = {
                title: getFullPageTitle([title_prefix, default_title, title_suffix]),
                description: default_description,
                keywords: default_keywords,
            }

            if (loading) return '⏲Loading...'
            return (
                <Fragment>
                    <DocumentMetadata {...metadata} />

                    <HotSpotContainer
                        image="https://pmet-public.github.io/luma-storybook/static/media/products-hotspots.b3dba30c.jpg"
                        description="A lot of stuffs"
                    >
                        <HotSpot
                            coords={{ x: 15, y: 42 }}
                            id={0}
                            label="Sweater"
                        >
                            <div>Knit Sweater - $29.99</div>
                        </HotSpot>
                        <HotSpot
                            coords={{ x: 78, y: 30 }}
                            id={1}
                            label="Bag"
                        >
                            <div>Handbag - $19.99</div>
                        </HotSpot>
                        <HotSpot
                            coords={{ x: 63, y: 75 }}
                            id={2}
                            label="Pants"
                        >
                            <div>Cotton Chinos - $29.99</div>
                        </HotSpot>
                    </HotSpotContainer>

                    {children}
                </Fragment>
            )
        }}
    </Query>
)

export default App