import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getSystemPrompt(type) {
  switch (type) {
    case 'problem':
      return 'You are a legislative policy expert. Generate clear, structured problem statements that identify issues requiring legislative action. Focus on the problem, its impact, and why legislation is needed.';
    case 'media':
      return 'You are a legislative communications expert. Generate comprehensive media materials including press releases, talking points, and social media content. Use professional language that is accessible to the public.';
    case 'idea':
      return 'You are a legislative policy analyst. Generate well-researched legislative ideas with clear objectives, implementation strategies, and expected outcomes. Focus on practical solutions to identified problems.';
    default:
      return 'You are a legislative drafting expert. Generate well-structured legislative bills with proper sections, findings, definitions, and operative provisions. Follow standard legislative format and language.';
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type, stream = false, model = 'gpt-4o-mini' } = await req.json();

    console.log('Generating content:', { type, model, promptLength: prompt?.length, stream });

    // Determine if this is a Claude model
    const isClaudeModel = model.startsWith('claude-');
    
    if (isClaudeModel && !anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }
    
    if (!isClaudeModel && !openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let response;
    
    if (isClaudeModel) {
      // Use Claude API
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anthropicApiKey}`,
          'Content-Type': 'application/json',
          'x-api-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `${getSystemPrompt(type)}\n\n${prompt}`
          }],
          temperature: 0.7,
          stream: stream,
        }),
      });
    } else {
      // Use OpenAI API
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { 
              role: 'system', 
              content: getSystemPrompt(type)
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: stream,
        }),
      });
    }

    if (!response.ok) {
      const error = await response.text();
      console.error(`${isClaudeModel ? 'Claude' : 'OpenAI'} API error:`, error);
      throw new Error(`${isClaudeModel ? 'Claude' : 'OpenAI'} API error: ${response.status}`);
    }

    if (stream) {
      // Return streaming response
      return new Response(response.body, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/plain',
          'Transfer-Encoding': 'chunked'
        },
      });
    } else {
      // Return complete response
      const data = await response.json();
      let generatedText;
      
      if (isClaudeModel) {
        generatedText = data.content[0].text;
      } else {
        generatedText = data.choices[0].message.content;
      }

      console.log('Content generated successfully');

      return new Response(JSON.stringify({ generatedText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-with-openai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});