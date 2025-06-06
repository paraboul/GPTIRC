# GPTIRC

A fictional IRC server powered by OpenAI's GPT-4o that simulates realistic IRC conversations with AI-generated users.

## What it does

Creates a simulated IRC server where virtual users with unique personalities interact with you in real-time. Each channel has 15+ AI users with realistic nicknames and personalities that match the channel theme. Includes a special IRC operator called "God" who is always supportive.

## Setup

1. **Install dependencies**:
   ```bash
   yarn
   ```

2. **Set your OpenAI API key**:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

3. **Start the server**:
   ```bash
   node --experimental-strip-types index.ts
   ```

4. **Connect with any IRC client to `127.0.0.1:6667`**

## Requirements

- Node.js 18+
- OpenAI API key
- IRC client
