const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const USE_OPENAI = process.env.USE_OPENAI === 'true';
const USE_ANTHROPIC = process.env.USE_ANTHROPIC === 'true';

async function askLLM(question) {
    if (USE_OPENAI && OPENAI_API_KEY) {
        return askOpenAI(question);
    } else if (USE_ANTHROPIC && ANTHROPIC_API_KEY) {
        return askAnthropic(question);
    } else {
        console.error('No valid API key or model selection found in environment variables');
        return null;
    }
}

async function askOpenAI(question) {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: question }],
            temperature: 0.7,
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error querying OpenAI:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function askAnthropic(question) {
    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: "claude-2",
            messages: [{ role: "user", content: question }],
            max_tokens_to_sample: 150
        }, {
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        return response.data.content[0].text.trim();
    } catch (error) {
        console.error('Error querying Anthropic:', error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = { askLLM };
