
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
const nysApiKey = Deno.env.get('NYS_LEGISLATION_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced system prompt for legislative analysis
function getSystemPrompt(type, context = null) {
  const basePrompts = {
    'problem': 'You are a legislative policy expert. Generate clear, structured problem statements that identify issues requiring legislative action. Focus on the problem, its impact, and why legislation is needed.',
    'media': `You are a senior legislative communications expert and media strategist. Your task is to create comprehensive, professional media materials for policy solutions. 

IMPORTANT INSTRUCTIONS:
- Always use SPECIFIC details from the policy solution provided (names, timelines, mechanisms, stakeholders)
- NEVER use generic placeholders like [Policy Solution Name] or [Organization Name]
- Extract and reference actual implementation phases, expected outcomes, and concrete benefits
- Create targeted messaging for the specific stakeholders mentioned in the policy
- Use professional language that is accessible to the public and media
- Include real quotes and concrete data points when available in the source material
- Structure content for immediate media use (press releases, talking points, social media content)

Your media materials should be publication-ready and reflect the actual substance and specifics of the policy solution.`,
    'idea': 'You are a legislative policy analyst. Generate well-researched legislative ideas with clear objectives, implementation strategies, and expected outcomes. Focus on practical solutions to identified problems.',
    'default': 'You are a legislative analysis expert with access to New York State legislative data. Provide comprehensive, accurate analysis based on current legislative information. Always cite relevant bills, sponsors, and committee actions when available.'
  };

  let systemPrompt = basePrompts[type] || basePrompts['default'];
  
  if (context && context.nysData) {
    systemPrompt += `\n\nYou have access to current NYS legislative data including:\n${context.nysData}\n\nUse this information to provide accurate, up-to-date legislative analysis.`;
  }
  
  return systemPrompt;
}

// Function to search NYS legislation data
async function searchNYSData(query, entityType = null) {
  if (!nysApiKey) {
    console.log('NYS API key not available, skipping legislative data search');
    return null;
  }

  try {
    const searchTypes = entityType ? [entityType] : ['bills', 'members', 'laws'];
    const results = {};

    for (const searchType of searchTypes) {
      try {
        const apiUrl = `https://legislation.nysenate.gov/api/3/${searchType}/search?term=${encodeURIComponent(query)}&limit=5&key=${nysApiKey}`;
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.result?.items?.length > 0) {
            results[searchType] = data.result.items.slice(0, 3); // Limit to top 3 results
          }
        }
      } catch (error) {
        console.error(`Error searching ${searchType}:`, error);
      }
    }

    return Object.keys(results).length > 0 ? results : null;
  } catch (error) {
    console.error('Error in NYS data search:', error);
    return null;
  }
}

// Function to format NYS data for context
function formatNYSDataForContext(nysData) {
  if (!nysData) return '';

  let contextText = 'CURRENT NYS LEGISLATIVE DATA:\n\n';

  if (nysData.bills) {
    contextText += 'RECENT BILLS:\n';
    nysData.bills.forEach((bill, index) => {
      contextText += `${index + 1}. ${bill.printNo || bill.basePrintNo} - ${bill.title || 'No title'}\n`;
      contextText += `   Status: ${bill.status?.statusDesc || 'Unknown'}\n`;
      contextText += `   Sponsor: ${bill.sponsor?.member?.shortName || 'Unknown'}\n\n`;
    });
  }

  if (nysData.members) {
    contextText += 'RELEVANT MEMBERS:\n';
    nysData.members.forEach((member, index) => {
      contextText += `${index + 1}. ${member.shortName} (${member.chamber})\n`;
      contextText += `   District: ${member.districtCode || 'N/A'}\n\n`;
    });
  }

  if (nysData.laws) {
    contextText += 'RELEVANT LAWS:\n';
    nysData.laws.forEach((law, index) => {
      contextText += `${index + 1}. ${law.lawId} - ${law.name || 'No name'}\n\n`;
    });
  }

  return contextText;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      type = 'default', 
      stream = false, 
      model = 'gpt-4o-mini',
      entityContext = null,
      enhanceWithNYSData = true 
    } = await req.json();

    console.log('Generating content:', { type, model, promptLength: prompt?.length, stream, enhanceWithNYSData });

    // Determine model provider
    const isClaudeModel = model.startsWith('claude-');
    const isPerplexityModel = model.startsWith('llama-') || model.startsWith('perplexity-');
    
    if (isClaudeModel && !anthropicApiKey) {
      console.error('Anthropic API key not configured');
      throw new Error('Claude model requires Anthropic API key to be configured in Supabase Edge Function Secrets');
    }
    
    if (isPerplexityModel && !perplexityApiKey) {
      console.error('Perplexity API key not configured');
      throw new Error('Perplexity model requires Perplexity API key to be configured in Supabase Edge Function Secrets');
    }
    
    if (!isClaudeModel && !isPerplexityModel && !openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI model requires OpenAI API key to be configured in Supabase Edge Function Secrets');
    }

    // Search for relevant NYS legislative data if enabled
    let nysData = null;
    if (enhanceWithNYSData && nysApiKey && type !== 'media') {
      // Skip NYS data search for media kit generation to focus on the provided solution content
      const searchQuery = prompt.toLowerCase().includes('bill') ? prompt : 
                         entityContext?.bill?.bill_number || 
                         entityContext?.member?.name ||
                         entityContext?.committee?.name ||
                         prompt;
      
      nysData = await searchNYSData(searchQuery, entityContext?.type);
    }

    // Build enhanced context
    const context = {
      nysData: nysData ? formatNYSDataForContext(nysData) : null
    };

    const systemPrompt = getSystemPrompt(type, context);
    const enhancedPrompt = context.nysData ? 
      `${prompt}\n\n[Note: Use the provided NYS legislative data to enhance your response with current, accurate information.]` : 
      prompt;

    let response;
    
    if (isClaudeModel) {
      // Use Claude API
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anthropicApiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `${systemPrompt}\n\n${enhancedPrompt}`
          }],
          temperature: 0.7,
        }),
      });
    } else if (isPerplexityModel) {
      // Use Perplexity API
      response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { 
              role: 'system', 
              content: systemPrompt
            },
            { role: 'user', content: enhancedPrompt }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 2000,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'month',
          frequency_penalty: 1,
          presence_penalty: 0,
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
              content: systemPrompt
            },
            { role: 'user', content: enhancedPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: stream,
        }),
      });
    }

    if (!response.ok) {
      const error = await response.text();
      const providerName = isClaudeModel ? 'Claude' : isPerplexityModel ? 'Perplexity' : 'OpenAI';
      console.error(`${providerName} API error:`, error);
      throw new Error(`${providerName} API error: ${response.status}`);
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
        // OpenAI and Perplexity use the same response format
        generatedText = data.choices[0].message.content;
      }

      console.log('Content generated successfully with NYS data enhancement:', !!nysData);

      return new Response(JSON.stringify({ 
        generatedText,
        nysDataUsed: !!nysData,
        searchResults: nysData 
      }), {
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
