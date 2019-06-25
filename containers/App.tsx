import React, { FunctionComponent, Fragment } from 'react'
import { gql } from 'apollo-boost'
import { Query } from 'react-apollo'
import { getFullPageTitle } from '@app/lib/helpers'
import { DocumentMetadataProps } from '@app/components/DocumentMetadata'
import DocumentMetadata from '@app/components/DocumentMetadata'
import TabBar, { TabBarItem } from 'luma-storybook/dist/components/TabBar'
import AppBar from 'luma-storybook/dist/components/AppBar'
import Icon from 'luma-storybook/dist/components/Icon'
import Image from 'luma-storybook/dist/components/Image'

import IconHanger from 'luma-storybook/src/components/Icon/svgs/thin/hanger.svg'
import IconHeart from 'luma-storybook/src/components/Icon/svgs/thin/heart.svg'
import IconMagnifier from 'luma-storybook/src/components/Icon/svgs/thin/magnifier.svg'
import IconBag from 'luma-storybook/src/components/Icon/svgs/thin/bag.svg'

const APP_SHELL_QUERY = gql`
    query AppShellQuery {
        flashMessage @client { 
            type
            message
        }
        storeConfig {
            header_logo_src
            logo_alt
            default_description
            default_keywords
            default_title
            title_prefix
            title_suffix
        }
    }
`

const App: FunctionComponent<any> = ({ children }) => (
    <Query query={APP_SHELL_QUERY} fetchPolicy="cache-first" errorPolicy="all">
        {({ loading, data: {
            // flashMessage,
            storeConfig: {
                header_logo_src,
                logo_alt,
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

                    <AppBar hideOnOffset={200}>
                        <Image src={header_logo_src} alt={logo_alt || default_title} />
                    </AppBar>
                    
                    {children}

                    <TabBar>
                        <TabBarItem isActive={true}>
                            <Icon label="Shop" svg={<IconHanger />} />
                        </TabBarItem>    
                        
                        <TabBarItem>
                            <Icon label="Favorites" svg={<IconHeart />} />
                        </TabBarItem>    
                        
                        <TabBarItem>
                            <Icon label="Search" svg={<IconMagnifier />} />
                        </TabBarItem>    

                        <TabBarItem>
                            <Icon label="Shop" svg={<IconBag />} count={3} />
                        </TabBarItem>    
                    </TabBar>
                </Fragment>
            )
        }}
    </Query>
)

export default App