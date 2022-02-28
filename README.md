<h1 align="center">Github registry utils</h1>

`github-registry-utils` is a tool made for unpublishing github registry package versions easily.

## Table of Contents

- [Installation](#Installation)
- [How to use](#How-to-use)

## Installation

```sh
npm i github-registry-utils
```

## How to use:

```js
const github = new Github({
  GITHUB_TOKEN: 'ghp_Qh...6K',
  PACKAGES_SCOPE: 'magic-system',
  REPO_NAME: 'bouger',
})

github.unpublishPackages()
```

You'll be prompt to choose wich version you want to unpublish
