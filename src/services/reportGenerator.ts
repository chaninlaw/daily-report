import * as fs from 'fs'
import * as path from 'path'

export async function generateReport(
  commits: { hash: string; message: string; diff: string }[],
  format: string,
  outputPath: string,
  workspacePath: string,
  replaceFileName?: string
) {
  const resolvedPath = outputPath.replace('${workspaceFolder}', workspacePath)
  if (!fs.existsSync(resolvedPath)) {
    fs.mkdirSync(resolvedPath, { recursive: true })
  }

  const fileName = replaceFileName ?? `daily_report.${format}`
  if (format === 'json') {
    fs.writeFileSync(path.join(resolvedPath, fileName), JSON.stringify(commits, null, 2))
  } else if (format === 'markdown') {
    const markdownContent = generateMarkdown(commits)
    fs.writeFileSync(path.join(resolvedPath, fileName), markdownContent)
  }
}

function generateMarkdown(changes: any[]): string {
  const today = new Date().toISOString().split('T')[0]
  let markdown = `## Daily Report for ${today}\n\n`

  for (const change of changes) {
    markdown += `### Commit: ${change.message} (${change.hash})\n`
    markdown += `\`\`\`diff\n${change.diff}\n\`\`\`\n\n`
  }

  return markdown
}
