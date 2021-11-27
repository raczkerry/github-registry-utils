import axios from 'axios'
import { PACKAGES_SCOPE, REPO_NAME } from './index.mjs'

export async function retreivePackagesLastVersion() {
  try {
    const { data } = await axios.post('https://api.github.com/graphql', {
      query: `query{repository(owner:"${PACKAGES_SCOPE}",name:"${REPO_NAME}"){packages(first:50){nodes{name,id,versions(first:1){nodes{id,version}}}}}}`
    })

    return data.data.repository.packages.nodes
      .filter(pkg => !pkg.name.includes('deleted'))
      .map(pkg => ({
        name: pkg.name,
        ...pkg.versions.nodes[0]
      }))
  } catch (error) {
    if (error.response?.data) console.log('ERROR => ', error.response.data)
    else console.log(error)

    process.exit(1)
  }
}
