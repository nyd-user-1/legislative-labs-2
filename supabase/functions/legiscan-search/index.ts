
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const legiscanApiKey = Deno.env.get('LEGISCAN_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation, params = {} } = await req.json();
    
    console.log('Legiscan API request:', { operation, params });

    if (!legiscanApiKey) {
      throw new Error('Legiscan API key not configured');
    }

    // Build the API URL based on operation
    let apiUrl = `https://api.legiscan.com/?key=${legiscanApiKey}&op=${operation}`;
    
    // Add parameters to the URL
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        apiUrl += `&${key}=${encodeURIComponent(String(value))}`;
      }
    }

    console.log('Calling Legiscan API:', apiUrl.replace(legiscanApiKey, 'REDACTED'));

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('Legiscan API error:', response.status, response.statusText);
      throw new Error(`Legiscan API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Legiscan API response received');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in legiscan-search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
