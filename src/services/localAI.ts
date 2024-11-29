import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
export class LocalAIGenerator {
    public template: string

    constructor(public prompt: string = '') {
        this.template = `
        You are a professional assistant tasked with generating a concise daily report. Use the following format:
        ### **Daily Report**\n
        **Date:** ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })}\n
        **1. Completed Tasks**\n
        [Insert 2-:max-bullet bullet points summarizing completed tasks]\n
        **2. In Progress**\n
        [Provide 2 to :max-bullet bullet points summarizing ongoing tasks with their respective progress percentages]\n
        **3. Issues**\n
        [Insert 1-:max-bullet bullet points summarizing challenges or blockers]
        `
    }

    async generate(resolvedPath?: string, fileName?: string) {
        const config = vscode.workspace.getConfiguration('daily-report')
        const endpoint = config.get<string>('aiSummarizationEndpoint') || 'http://localhost:11434'
        const model = config.get<string>('aiSummarizationModels') || 'llama3.2:1b'
        const prefixPrompt = config.get<string>('aiSummarizationPrefixPrompt') || ''
        const maxBullet = config.get<string>('maxBullet') || 3

        const finallyPrompt = `${prefixPrompt ? prefixPrompt + ' ' : ''}${this.template.replaceAll(':max-bullet', maxBullet.toString()) + this.prompt}`

        if (resolvedPath) {
            fs.writeFileSync(path.join(resolvedPath, `${fileName || 'Prompt'}.txt`), finallyPrompt)
        }

        const response = await fetch(`${endpoint}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                stream: false,
                model: model,
                prompt: finallyPrompt
            }),
        })

        const json = await response.json() as { response: string }
        return json.response
    }
}