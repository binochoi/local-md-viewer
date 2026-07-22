import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const LOCKFILES = ['package-lock.json', 'pnpm-lock.yaml']

execSync('npm version patch --no-git-tag-version', { stdio: 'inherit' })

const { version } = JSON.parse(readFileSync('package.json', 'utf-8'))
const filesToAdd = ['package.json', ...LOCKFILES.filter(existsSync)]

execSync(`git add ${filesToAdd.join(' ')}`, { stdio: 'inherit' })
execSync(`git commit -m "chore: bump version to ${version}"`, { stdio: 'inherit' })

console.log(`Bumped and committed version ${version}`)
