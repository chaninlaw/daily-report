import * as fs from 'fs'
import * as path from 'path'

const configFilePath = path.join(require('os').homedir(), '.daily-report.cfg')

// Function to read the OpenAI key from the config file
export function getOpenAIKey(): string | null {
  try {
    if (fs.existsSync(configFilePath)) {
      const config = fs.readFileSync(configFilePath, 'utf8')
      const configJson = JSON.parse(config)
      return configJson.openaiKey || null
    }
  } catch (error) {
    console.error('Error reading API key from config file:', error)
  }
  return null
}

// Function to save the OpenAI key to the config file
export function saveOpenAIKey(apiKey: string): void {
  const config = { openaiKey: apiKey }
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2))
    console.log('API key saved successfully!')
  } catch (error) {
    console.error('Error saving API key to config file:', error)
  }
}
