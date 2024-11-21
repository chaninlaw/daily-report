import { OpenAI } from 'openai'

export async function summarizeCommitsWithAI(
  commitMessages: string,
  openai: OpenAI
): Promise<string | null> {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Summarize the following git commit diffs: \n${commitMessages}`,
        },
      ],
      model: 'gpt-4',
      max_tokens: 1000, // Limit summary size, adjust as needed
    })

    const summary = response.choices[0].message.content
    const summaryFilePath = '/tmp/daily-summary.txt' // Temporary summary file (can be dynamic)

    // Save the summary to a file
    const fs = require('fs')
    fs.writeFileSync(summaryFilePath, summary)

    return summaryFilePath // Path to the summary file
  } catch (error) {
    console.error('AI summarization error:', error)
    return null
  }
}
