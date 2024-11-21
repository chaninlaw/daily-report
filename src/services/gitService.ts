import simpleGit, { SimpleGit } from 'simple-git'

export async function getGitCommits(workspacePath: string) {
  const git: SimpleGit = simpleGit(workspacePath)

  // Get today's date
  const today = new Date()
  const midnight = '00:00'
  const since = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()} ${midnight}`
  const user = await git.getConfig('user.email', 'global')

  if (!user.value) {
    throw new Error('No email configured!')
  }

  const commits = await git.log({
    '--after': since,
    '--author': user.value,
  })

  return await Promise.all(
    commits.all.map(async (commit) => ({
      hash: commit.hash,
      message: commit.message,
      diff: await git.show([commit.hash]),
    }))
  )
}
