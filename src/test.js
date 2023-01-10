const { Github } = require('../build/github')

const github = new Github({
  GITHUB_TOKEN: process.argv[2],
  ORGANISATION: 'cloud-weasel',
  REPO_NAME: 'clea',
})

async function doThing() {
  const nextVersion = await github.getNewVersionNumber()
  return nextVersion
}

doThing()
