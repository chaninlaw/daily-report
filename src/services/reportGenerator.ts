import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

import { LocalAIGenerator } from './localAI';

export async function generateReport(
  commits: { hash: string; message: string; diff: string }[],
  format: string,
  outputPath: string,
  workspacePath: string,
  replaceFileName?: string
) {
  const config = vscode.workspace.getConfiguration('daily-report')

  const resolvedPath = outputPath.replace('${workspaceFolder}', workspacePath)
  if (!fs.existsSync(resolvedPath)) {
    fs.mkdirSync(resolvedPath, { recursive: true })
  }

  const fileName = replaceFileName ?? `daily_report.${format}`

  let summaryStr = ''
  const isAiSummarizationEnable = config.get<boolean>('aiSummarizationEnabled', false)
  if (isAiSummarizationEnable) {
    const generator = new LocalAIGenerator(commits.map((commit) => commit.message).join(', '))
    summaryStr = await generator.generate()
    summaryStr = format === 'json' ? JSON.stringify({
      type: 'AI Generated',
      summary: summaryStr,
    }) : summaryStr
  } else if (format === 'json') {
    summaryStr = JSON.stringify(commits, null, 2)
  } else if (format === 'markdown') {
    summaryStr = generateMarkdown(commits)
  }

  fs.writeFileSync(path.join(resolvedPath, fileName), summaryStr)
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
