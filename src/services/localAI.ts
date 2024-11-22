import * as vscode from 'vscode'
export class LocalAIGenerator {
    public template: string

    constructor(public prompt: string = '') {
        this.template = `
        You are a professional assistant tasked with generating a concise daily report. Use the following format:
        ### **Daily Report**
        **Date:** ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })}\n
        **1. Completed Tasks**\n
        [Insert 2-3 bullet points summarizing completed tasks]
        **2. In Progress**\n
        [Insert 2-3 bullet points summarizing ongoing tasks with progress percentages]\n
        **3. Issues**
        [Insert 1-2 bullet points summarizing challenges or blockers]\n
        **4. Tomorrow's Plan**
        [Insert 2-3 bullet points summarizing planned tasks for the next day]\n
        Generate the daily report based on this input:
        `
    }

    async generate() {
        const config = vscode.workspace.getConfiguration('daily-report')
        const response = await fetch(`${config.get<string>('aiSummarizationEndpoint') || 'http://localhost:11434'}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                stream: false,
                model: 'llama3.2:1b',
                prompt: this.template + this.prompt
            }),
        })

        const json = await response.json() as { response: string }
        return json.response
    }
}