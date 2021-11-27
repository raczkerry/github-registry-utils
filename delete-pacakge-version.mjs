import axios from 'axios'

export async function deletePackageVersion(versionId) {
  try {
    await axios.post(
      'https://api.github.com/graphql',
      { query: `mutation { deletePackageVersion(input:{packageVersionId:\"${versionId}\"}) { success }}` },
      {
        headers: {
          accept: 'application/vnd.github.package-deletes-preview+json'
        }
      }
    )
  } catch (error) {
    if (error.response?.data) console.log('ERROR => ', error.response.data)
    else console.log(error)

    process.exit(1)
  }
}
