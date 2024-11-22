import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export class ReportViewer {
  static currentPanel: ReportViewer | undefined
  private readonly panel: vscode.WebviewPanel
  private readonly extensionUri: vscode.Uri

  constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel
    this.extensionUri = extensionUri

    // Set initial HTML content
    this.update('')
  }

  public static show(extensionUri: vscode.Uri, reportPath: string) {
    const column = vscode.ViewColumn.One

    // Check if a WebView is already active
    if (ReportViewer.currentPanel) {
      ReportViewer.currentPanel.panel.reveal(column)
      ReportViewer.currentPanel.update(reportPath)
      return
    }

    // Create a new WebView
    const panel = vscode.window.createWebviewPanel('reportViewer', 'Daily Report Viewer', column, {
      enableScripts: true,
      retainContextWhenHidden: true,
    })

    ReportViewer.currentPanel = new ReportViewer(panel, extensionUri)
    ReportViewer.currentPanel.update(reportPath)

    panel.onDidDispose(() => {
      ReportViewer.currentPanel = undefined
    })
  }

  public static async open(path: string): Promise<void> {
    try {
      // Open the file as a text document
      const document = await vscode.workspace.openTextDocument(path);

      // Show the document in the editor
      await vscode.window.showTextDocument(document);
    } catch (error: any) {
      console.error('Error opening file:', error);
      vscode.window.showErrorMessage(`Could not open file: ${error?.message ?? 'Unknown error'}`);
    }
  }

  private update(reportPath: string) {
    if (!fs.existsSync(reportPath)) {
      this.panel.webview.html = this.getErrorHtml()
      return
    }

    const content = fs.readFileSync(reportPath, 'utf-8')
    const escapedContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;')

    this.panel.webview.html = this.getHtml(escapedContent)
  }

  private getErrorHtml(): string {
    return `<h1>Report not found!</h1>`
  }

  private getHtml(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Report</title>
      </head>
      <body>
        <pre>${content}</pre>
      </body>
      </html>
    `
  }
}

/**
 * import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export class ReportViewer {
  static currentPanel: ReportViewer | undefined
  private readonly panel: vscode.WebviewPanel
  private readonly extensionUri: vscode.Uri

  private reportData: { hash: string; message: string; diff: string }[] = []

  constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel
    this.extensionUri = extensionUri

    // Set up message handling
    this.panel.webview.onDidReceiveMessage(
      (message) => this.handleMessage(message),
      undefined
    )

    // Dispose the panel on close
    this.panel.onDidDispose(() => {
      ReportViewer.currentPanel = undefined
    })
  }

  public static show(extensionUri: vscode.Uri, reportPath: string) {
    const column = vscode.ViewColumn.One

    // Check if a WebView is already active
    if (ReportViewer.currentPanel) {
      ReportViewer.currentPanel.panel.reveal(column)
      ReportViewer.currentPanel.update(reportPath)
      return
    }

    // Create a new WebView
    const panel = vscode.window.createWebviewPanel(
      'reportViewer',
      'Daily Report Viewer',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    )

    ReportViewer.currentPanel = new ReportViewer(panel, extensionUri)
    ReportViewer.currentPanel.update(reportPath)
  }

  private update(reportPath: string) {
    if (!fs.existsSync(reportPath)) {
      this.panel.webview.html = this.getErrorHtml()
      return
    }

    const content = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
    this.reportData = content

    this.panel.webview.html = this.getHtml(content)
  }

  private getHtml(
    reportData: { hash: string; message: string; diff: string }[]
  ): string {
    const reportRows = reportData
      .map(
        (commit) => `
        <div class="commit">
          <strong>Commit: ${commit.message}</strong> (${commit.hash})
          <pre>${commit.diff}</pre>
        </div>`
      )
      .join('')

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 10px; }
          .search-bar, .filter { margin-bottom: 10px; }
          .commit { margin-bottom: 20px; }
          pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div>
          <input class="search-bar" type="text" placeholder="Search commits..." oninput="searchCommits(event)">
          <select class="filter" onchange="filterByFile(event)">
            <option value="">All Files</option>
          </select>
        </div>
        <div id="report">${reportRows}</div>
        <script>
          const reportData = ${JSON.stringify(reportData)};
          const reportContainer = document.getElementById('report');
          const filterSelect = document.querySelector('.filter');

          // Populate file filters
          const uniqueFiles = [...new Set(reportData.flatMap(commit => commit.diff.match(/(?<=\\+\\+\\+ b\\/).+/g) || []))];
          uniqueFiles.forEach(file => {
            const option = document.createElement('option');
            option.value = file;
            option.textContent = file;
            filterSelect.appendChild(option);
          });

          function searchCommits(event) {
            const query = event.target.value.toLowerCase();
            const filtered = reportData.filter(commit => commit.message.toLowerCase().includes(query));
            renderCommits(filtered);
          }

          function filterByFile(event) {
            const file = event.target.value;
            if (!file) {
              renderCommits(reportData);
              return;
            }

            const filtered = reportData.filter(commit => commit.diff.includes(file));
            renderCommits(filtered);
          }

          function renderCommits(data) {
            reportContainer.innerHTML = data
              .map(commit => \`
                <div class="commit">
                  <strong>Commit: \${commit.message}</strong> (\${commit.hash})
                  <pre>\${commit.diff}</pre>
                </div>
              \`)
              .join('');
          }
        </script>
      </body>
      </html>
    `
  }

  private getErrorHtml(): string {
    return `<h1>Report not found!</h1>`
  }

  private handleMessage(message: { command: string; text?: string }) {
    switch (message.command) {
      case 'search':
        // Handle search or other actions if needed
        break
      default:
        break
    }
  }
}

 */
