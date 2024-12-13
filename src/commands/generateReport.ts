
import * as vscode from 'vscode'
import path from 'path'

import { getGitCommits } from '../services/gitService'
import { generateReport } from '../services/reportGenerator'

import { ReportViewer } from '../webviews/reportViewer'

import { DateGenerator } from '../utils/dateGenerator'

export async function generateReportCommand() {
  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating Daily Report',
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: 'Collecting Git commits...' })

        const workspaceFolders = vscode.workspace.workspaceFolders
        if (!workspaceFolders) {
          throw new Error('No workspace folder found!')
        }

        // Step 1: Let the user choose a repository
        const folderChoices = workspaceFolders.map((folder) => ({
          label: folder.name,
          description: folder.uri.fsPath,
        }))

        const selectedFolder = await vscode.window.showQuickPick(folderChoices, {
          placeHolder: 'Select a repository to generate the daily report',
        })

        if (!selectedFolder) {
          throw new Error('No repository selected!')
        }

        const selectedPath = selectedFolder.description

        // Step 2: Fetch commits
        const commits = await getGitCommits(selectedPath)

        if (!commits.length) {
          throw new Error('No commits found for today!')
        }

        progress.report({ message: 'Generating report...' })

        // Step 3: Let the user choose files (optional)
        const commitFiles = commits.flatMap((commit) =>
          (commit.diff.match(/(?<=\+\+\+ b\/).*/g) || []).map((file) => ({
            commitHash: commit.hash,
            filePath: file,
            diff: commit.diff,
          }))
        )

        const config = vscode.workspace.getConfiguration('daily-report')
        const ignoredFiles = config.get<string[]>('ignoreFiles') || []

        const fileChoices = Array.from(new Set(commitFiles.map((file) => file.filePath)))
          .map((filePath) => ({
            label: filePath,
          }))
          .filter(
            (file) =>
              !ignoredFiles.some((pattern) =>
                new RegExp(pattern.replace(/\*/g, '.*')).test(file.label)
              )
          )

        const selectedFiles = await vscode.window.showQuickPick(fileChoices, {
          placeHolder: 'Select files to include in the report (press Enter to select all)',
          canPickMany: true,
        })

        // Step 3: Filter commits based on the selected files and ignored files
        const filteredCommits = commits.filter((commit) =>
          (selectedFiles?.length ? selectedFiles : fileChoices).some(
            (file) =>
              commit.diff.includes(file.label) && // Match commit diff to selected file
              !ignoredFiles.some(
                (
                  pattern // Ensure ignored files are excluded
                ) => new RegExp(pattern.replace(/\*/g, '.*')).test(file.label)
              )
          )
        )

        // Step 4: Generate the report
        progress.report({ message: 'Generating report...' })
        const outputFormat = config.get<string>('outputFormat') || 'json'
        const outputPath = config.get<string>('outputPath') || '${workspaceFolder}/daily_report'
        const workspaceFolderPath = workspaceFolders[0].uri.fsPath
        const resolvedPath = outputPath.replace('${workspaceFolder}', workspaceFolderPath)
        const dg = new DateGenerator();
        const fileName = `${dg.formatDate(dg.getCurrentDate(), 'YYYY-MM-DD')}_report.${outputFormat}`
        const generatedFilePath = path.join(resolvedPath, fileName)
        await generateReport(filteredCommits, outputFormat, outputPath, selectedPath, fileName)

        // Show the WebView
        // ReportViewer.show(vscode.Uri.file(__dirname), generatedFilePath)
        ReportViewer.open(generatedFilePath)


        vscode.window.showInformationMessage(`Daily report generated successfully!`)
      }
    )
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating report: ${error}`)
  }
}
