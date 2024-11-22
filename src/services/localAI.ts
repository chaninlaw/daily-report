export class LocalAIGenerator {
    public template: string

    constructor(public prompt: string = '') {
        this.template = "You are a professional assistant tasked with generating a concise daily report. Use the following format:\n\n### **Daily Report**\n**Date:** [Insert Date]\n\n**1. Completed Tasks**\n[Insert 2-3 bullet points summarizing completed tasks]\n\n**2. In Progress**\n[Insert 2-3 bullet points summarizing ongoing tasks with progress percentages]\n\n**3. Issues**\n[Insert 1-2 bullet points summarizing challenges or blockers]\n\n**4. Tomorrow’s Plan**\n[Insert 2-3 bullet points summarizing planned tasks for the next day]\n\nGenerate the daily report based on this input:\n "
    }

    async generate() {
        const response = await fetch('http://192.168.11.76:11434/api/generate', {
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