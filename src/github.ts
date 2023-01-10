import { Octokit } from 'octokit'
import semver from 'semver'
export class Github {
  private octokit: Octokit
  private ORGANISATION
  private REPO_NAME

  constructor({ GITHUB_TOKEN, ORGANISATION, REPO_NAME }: { GITHUB_TOKEN: string; ORGANISATION: string; REPO_NAME: string }) {
    this.ORGANISATION = ORGANISATION
    this.REPO_NAME = REPO_NAME

    this.octokit = new Octokit({ auth: GITHUB_TOKEN })
  }

  async getPackagesForVersion(
    version: string
  ): Promise<{ package_id: number; package_name: string; package_type: string; version_name: string; version_id: number }[]> {
    const packages = await this.octokit.rest.packages.listPackagesForOrganization({ org: this.ORGANISATION, package_type: 'npm' })
    const repo_packages = packages.data.filter(({ repository }) => repository?.name === this.REPO_NAME)

    const packages_with_version_id = await Promise.all(
      repo_packages.map(p =>
        (async () => {
          const { data: package_versions } = await this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({
            org: this.ORGANISATION,
            package_name: p.name,
            package_type: 'npm',
            page: 1,
            per_page: 1,
          })

          return {
            package_id: p.id,
            package_name: p.name,
            package_type: p.package_type,
            version_name: package_versions[0].name,
            version_id: package_versions[0].id,
          }
        })()
      )
    )

    return packages_with_version_id.filter(({ version_name }) => version_name === version)
  }

  async deletePackageVersion(package_name: string, package_version_id: number) {
    await this.octokit.rest.packages.deletePackageVersionForOrg({
      org: this.ORGANISATION,
      package_type: 'npm',
      package_name,
      package_version_id,
    })
  }

  async unpublishPackagesVersion(version: string) {
    const packages = await this.getPackagesForVersion(version)

    await Promise.all(packages.map(p => this.deletePackageVersion(p.package_name, p.version_id)))
  }

  async getNewVersionNumber() {
    const packages = await this.octokit.rest.packages.listPackagesForOrganization({ org: this.ORGANISATION, package_type: 'npm' })
    const repo_packages = packages.data.filter(({ repository }) => repository?.name === this.REPO_NAME)
    const first_package = repo_packages[0]

    const { data } = await this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({
      org: this.ORGANISATION,
      package_name: first_package.name,
      package_type: 'npm',
      page: 1,
      per_page: 1,
    })

    const current_version = data[0].name
    const next_version_number = semver.inc(current_version, 'patch')

    console.log(next_version_number)
    return next_version_number
  }
}
