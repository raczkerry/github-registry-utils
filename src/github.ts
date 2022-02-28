import { graphql } from '@octokit/graphql'
import inquirer from 'inquirer'

export class Github {
  private graphql = graphql
  private PACKAGES_SCOPE
  private REPO_NAME

  constructor({ GITHUB_TOKEN, PACKAGES_SCOPE, REPO_NAME }: { GITHUB_TOKEN: string; PACKAGES_SCOPE: string; REPO_NAME: string }) {
    this.PACKAGES_SCOPE = PACKAGES_SCOPE
    this.REPO_NAME = REPO_NAME

    this.graphql = graphql.defaults({
      headers: {
        authorization: `bearer ${GITHUB_TOKEN}`,
      },
    })
  }

  async retreivePackagesLastVersion(): Promise<{ name: string; version: string; id: string }[]> {
    const { repository } = await this.graphql(
      `query {
        repository(owner:"${this.PACKAGES_SCOPE}",name:"${this.REPO_NAME}") {
          packages(first:50) {
            nodes {
              name,id,versions(first:1) {
                nodes {
                  id,version
                }
              }
            }
          }
        }
      }`
    )

    return repository.packages.nodes
      .filter((pkg: any) => !pkg.name.includes('deleted'))
      .map((pkg: any) => ({
        name: pkg.name,
        ...pkg.versions.nodes[0],
      }))
  }

  async deletePackageVersion(versionId: string) {
    await this.graphql(
      `mutation {
        deletePackageVersion(input: {
          packageVersionId:\"${versionId}\"
        }) {
          success
        }
      }`,
      {
        headers: {
          accept: 'application/vnd.github.package-deletes-preview+json',
        },
      }
    )
  }

  async unpublishPackages() {
    try {
      const lastVersions = await this.retreivePackagesLastVersion()

      const answers = await inquirer.prompt([
        {
          type: 'checkbox',
          message: 'Select the packages you want to unpublish',
          name: 'versionIds',
          choices: () => lastVersions.map(({ name, version, id }) => ({ name: `${name}@${version}`, value: id })),
          validate: () => true,
        },
        {
          type: 'confirm',
          message: 'Are you sure?',
          name: 'confirm',
          choices: ['No', 'Yes'],
          validate: () => true,
        },
      ])

      if (answers.confirm) {
        await Promise.all(answers.versionIds.map((versionId: string) => this.deletePackageVersion(versionId)))
      } else {
        process.exit(1)
      }
    } catch (error: any) {
      if (error.response?.data) console.log('ERROR => ', error.response.data)
      else console.log(error)

      process.exit(1)
    }
  }
}
