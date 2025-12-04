/**
 * Test script untuk memverifikasi koneksi Azure OpenAI API
 * Run: npx tsx scripts/test-azure-openai.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface ChatMessage {
  role: string;
  content: string;
}

interface AzureResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function testAzureOpenAI() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  console.log('\n🔍 Checking Azure OpenAI Configuration...\n');
  console.log('Endpoint:', endpoint ? `${endpoint.slice(0, 30)}...` : '❌ MISSING');
  console.log('API Key:', key ? `${key.slice(0, 10)}...` : '❌ MISSING');
  console.log('Deployment:', deployment || '❌ MISSING');
  console.log('Simulate Mode:', process.env.SIMULATE_OPENAI || '0');

  if (!endpoint || !key || !deployment) {
    console.error('\n❌ Azure OpenAI configuration is incomplete!');
    console.error('Please set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, and AZURE_OPENAI_DEPLOYMENT in .env file');
    process.exit(1);
  }

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;
  
  console.log('\n📡 Testing connection to Azure OpenAI...\n');

  const messages: ChatMessage[] = [
    { 
      role: 'system', 
      content: 'You are a helpful parenting assistant. Respond in Bahasa Indonesia.' 
    },
    { 
      role: 'user', 
      content: 'Bagaimana cara menenangkan bayi yang menangis?' 
    }
  ];

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': key,
      },
      body: JSON.stringify({
        messages,
        max_completion_tokens: 2000, // GPT-5-mini needs more tokens for reasoning + output
        // temperature: 1, // GPT-5-mini only supports default temperature
      }),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Azure OpenAI API Error:');
      console.error(`Status: ${response.status} ${response.statusText}`);
      console.error(`Response: ${errorText}`);
      process.exit(1);
    }

    const data: AzureResponse = await response.json();
    
    // Debug: Print full response
    console.log('\n🔍 Full API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    const aiResponse = data.choices?.[0]?.message?.content?.trim();

    console.log('\n✅ Connection successful!\n');
    console.log('⏱️  Response time:', `${duration}ms`);
    console.log('\n📝 AI Response:');
    console.log('─'.repeat(60));
    console.log(aiResponse || '(empty response)');
    console.log('─'.repeat(60));

    if (data.usage) {
      console.log('\n📊 Token Usage:');
      console.log(`   Prompt tokens: ${data.usage.prompt_tokens}`);
      console.log(`   Completion tokens: ${data.usage.completion_tokens}`);
      console.log(`   Total tokens: ${data.usage.total_tokens}`);
    }

    console.log('\n✅ Azure OpenAI is working correctly!');
    console.log('🎉 Your chat AI should receive real responses from Azure.\n');

  } catch (error) {
    console.error('\n❌ Failed to connect to Azure OpenAI:');
    console.error(error);
    console.error('\nPlease check:');
    console.error('1. Your Azure OpenAI endpoint is correct');
    console.error('2. Your API key is valid');
    console.error('3. Your deployment name matches the one in Azure portal');
    console.error('4. Your network allows connections to Azure services');
    process.exit(1);
  }
}

testAzureOpenAI();
