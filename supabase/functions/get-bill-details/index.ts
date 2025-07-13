
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const nysApiKey = Deno.env.get('NYS_LEGISLATION_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { billNumber, sessionYear } = await req.json();
    
    console.log('Fetching bill details for:', { billNumber, sessionYear });

    if (!nysApiKey) {
      throw new Error('NYS Legislation API key not configured');
    }

    if (!billNumber) {
      throw new Error('Bill number is required');
    }

    const year = sessionYear || new Date().getFullYear();
    
    // Fetch bill details from NYS API
    const billUrl = `https://legislation.nysenate.gov/api/3/bills/${year}/${billNumber}?key=${nysApiKey}&view=info`;
    
    console.log('Calling NYS API for bill details:', billUrl.replace(nysApiKey, 'REDACTED'));

    const response = await fetch(billUrl);
    
    if (!response.ok) {
      console.error('NYS API error:', response.status, response.statusText);
      throw new Error(`NYS API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.result) {
      throw new Error('No bill data found');
    }

    const billData = data.result;
    
    // Extract enhanced details
    const enhancedDetails = {
      // Basic info
      basePrintNo: billData.basePrintNo,
      session: billData.session,
      printNo: billData.printNo,
      billType: billData.billType,
      title: billData.title,
      summary: billData.summary?.text || null,
      
      // Status and progress
      status: {
        statusType: billData.status?.statusType,
        statusDesc: billData.status?.statusDesc,
        actionDate: billData.status?.actionDate,
        committeeName: billData.status?.committeeName,
        billCalNo: billData.status?.billCalNo,
      },
      
      // Sponsor information
      sponsor: billData.sponsor ? {
        member: {
          memberId: billData.sponsor.member?.memberId,
          shortName: billData.sponsor.member?.shortName,
          fullName: billData.sponsor.member?.fullName,
          districtCode: billData.sponsor.member?.districtCode,
        },
        budget: billData.sponsor.budget,
        rules: billData.sponsor.rules,
      } : null,
      
      // Co-sponsors
      coSponsors: billData.amendments?.items ? 
        Object.values(billData.amendments.items)[0]?.coSponsors?.items || [] : [],
      
      // Legislative text
      activeVersion: billData.activeVersion,
      amendments: billData.amendments?.items || {},
      
      // Voting records
      votes: billData.votes?.items || [],
      
      // Actions/History
      actions: billData.actions?.items || [],
      
      // Additional metadata
      publishedDateTime: billData.publishedDateTime,
      substitutedBy: billData.substitutedBy,
      previousVersions: billData.previousVersions?.items || [],
    };

    console.log('Enhanced bill details fetched successfully');

    return new Response(JSON.stringify({
      success: true,
      result: enhancedDetails
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in get-bill-details function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
