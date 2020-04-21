import { useContext } from 'react'
import { StoryStoreContext } from '~/lib/storystore'

export const useStoryStore = () => {
    return useContext(StoryStoreContext)
}
