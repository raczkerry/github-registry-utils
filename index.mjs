import inquirer from 'inquirer'
import axios from 'axios'
import { deletePackageVersion } from './delete-pacakge-version.mjs'
import { retreivePackagesLastVersion } from './retreive-packages-last-versions.mjs'

const GITHUB_TOKEN = process.argv[2]
export const PACKAGES_SCOPE = process.argv[3]
export const REPO_NAME = process.argv[4]

async function app() {
  axios.defaults.headers.common['Authorization'] = `bearer ${GITHUB_TOKEN}`

  try {
    const lastVersions = await retreivePackagesLastVersion()

    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        message: 'Select the packages you want to unpublish',
        name: 'versionIds',
        choices: () => lastVersions.map(({ name, version, id }) => ({ name: `${name}@${version}`, value: id })),
        validate: () => true
      },
      {
        type: 'confirm',
        message: 'Are you sure?',
        name: 'confirm',
        choices: ['No', 'Yes'],
        validate: () => true
      }
    ])

    if (answers.confirm) {
      for (const id of answers.versionIds) {
        await deletePackageVersion(id)
      }
    } else {
      process.exit(1)
    }
  } catch (error) {
    if (error.response?.data) console.log('ERROR => ', error.response.data)
    else console.log(error)

    process.exit(1)
  }
}

app()
