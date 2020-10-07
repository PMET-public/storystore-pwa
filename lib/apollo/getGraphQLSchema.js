require('dotenv').config()
const fetch = require('cross-fetch')
const fs = require('fs')
const { URL } = require('url')
const url = new URL('/graphql', process.env.MAGENTO_URL)

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        variables: {},
        query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
    }),
})
    .then(result => result.json())
    .then(result => {
        const possibleTypes = {}

        result.data.__schema.types.forEach(supertype => {
            if (supertype.possibleTypes) {
                possibleTypes[supertype.name] = supertype.possibleTypes.map(subtype => subtype.name)
            }
        })

        fs.writeFile('./lib/apollo/possibleTypes.json', JSON.stringify(possibleTypes), err => {
            if (err) {
                console.error('Error writing possibleTypes.json', err)
            } else {
                console.log('Fragment types successfully extracted!')
            }
        })
    })
