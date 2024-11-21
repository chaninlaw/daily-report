import * as vscode from 'vscode'
import { generateReportCommand } from './commands/generateReport'

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "daily-report" is now active!')

  // Register the main command
  const disposable = vscode.commands.registerCommand(
    'daily-report.generateReport',
    generateReportCommand
  )

  // Add a status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100 // Priority
  )
  statusBarItem.text = '$(book) Generate Daily Report'
  statusBarItem.tooltip = 'Click to generate a daily report from Git commits'
  statusBarItem.command = 'daily-report.generateReport' // Trigger command
  statusBarItem.show()

  // Clean up on deactivate
  context.subscriptions.push(disposable, statusBarItem)
}

export function deactivate() {}
