import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NYSApiResponse<T> {
  success: boolean;
  message: string;
  responseType: string;
  result?: T;
  errorCode?: number;
  errorData?: any;
}

interface BillResponse {
  basePrintNo: string;
  session: number;
  printNo: string;
  billType: {
    chamber: "SENATE" | "ASSEMBLY";
    desc: string;
    resolution: boolean;
  };
  title: string;
  activeVersion: string;
  publishedDateTime: string;
  sponsor: {
    member: {
      memberId: number;
      shortName: string;
      fullName: string;
      districtCode: number;
    };
    budget: boolean;
    rules: boolean;
  };
  status: {
    statusType: string;
    statusDesc: string;
    actionDate: string;
    committeeName?: string;
    billCalNo?: number;
  };
  amendments: {
    items: {
      [version: string]: {
        fullText: string;
        memo?: string;
        lawSection?: string;
        coSponsors: { items: any[] };
      }
    };
  };
  votes?: { items: any[] };
  actions: { items: any[] };
}

interface AgendaResponse {
  year: number;
  agendaNo: number;
  committeeId?: {
    name: string;
    chamber: string;
  };
  committees?: {
    items: Array<{
      name?: string;
      committeeId?: {
        name: string;
        chamber: string;
      };
      chair?: string;
      meetingDateTime?: string;
      location?: string;
      bills?: {
        items: Array<{
          billId: {
            basePrintNo: string;
            session: number;
          };
          billCalNo: string;
        }>;
      };
    }>;
  };
}

interface MemberResponse {
  memberId: number;
  shortName: string;
  fullName: string;
  sessionYear: number;
  chamber: "SENATE" | "ASSEMBLY";
  incumbent: boolean;
  districtCode: number;
  person: {
    firstName: string;
    lastName: string;
    middleName?: string;
    suffix?: string;
    email?: string;
    prefix?: string;
  };
}

class NYSApiClient {
  private apiKey: string;
  private baseUrl = 'https://legislation.nysenate.gov/api/3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('key', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    console.log('Making request to:', url.toString().replace(this.apiKey, '[REDACTED]'));

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`NYS API request failed: ${response.status} ${response.statusText}`);
    }

    const data: NYSApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(`NYS API Error: ${data.message} (Code: ${data.errorCode})`);
    }

    return data.result!;
  }

  // Bills API
  async getBill(sessionYear: number, printNo: string): Promise<BillResponse> {
    return this.makeRequest<BillResponse>(`/bills/${sessionYear}/${printNo}`);
  }

  async searchBills(term: string, sessionYear?: number, limit: number = 50, offset: number = 0): Promise<any> {
    const endpoint = sessionYear ? `/bills/${sessionYear}/search` : '/bills/search';
    return this.makeRequest(endpoint, { term, limit, offset, sort: 'publishedDateTime:DESC' });
  }

  async getBillUpdates(fromDate: string, toDate: string): Promise<any> {
    return this.makeRequest(`/bills/updates/${fromDate}/${toDate}`, {
      type: 'published',
      detail: true
    });
  }

  // Agendas API
  async getAgenda(year: number, agendaNo: number, committeeName?: string): Promise<AgendaResponse> {
    const endpoint = committeeName 
      ? `/agendas/${year}/${agendaNo}/${encodeURIComponent(committeeName)}`
      : `/agendas/${year}/${agendaNo}`;
    return this.makeRequest<AgendaResponse>(endpoint);
  }

  async listAgendas(year: number, limit: number = 50, offset: number = 0): Promise<any> {
    return this.makeRequest(`/agendas/${year}`, { limit, offset, sort: 'agendaNo:DESC' });
  }

  async getCommitteeMeetings(fromDate: string, toDate: string): Promise<any> {
    return this.makeRequest(`/agendas/meetings/${fromDate}/${toDate}`);
  }

  // Members API
  async getMember(sessionYear: number, id: number): Promise<MemberResponse> {
    return this.makeRequest<MemberResponse>(`/members/${sessionYear}/${id}`);
  }

  async listMembers(sessionYear: number, chamber?: string, limit: number = 50, offset: number = 0): Promise<any> {
    const endpoint = chamber 
      ? `/members/${sessionYear}/${chamber.toUpperCase()}`
      : `/members/${sessionYear}`;
    return this.makeRequest(endpoint, { limit, offset });
  }

  async searchMembers(term: string, limit: number = 50, offset: number = 0): Promise<any> {
    return this.makeRequest('/members/search', { term, limit, offset });
  }

  // Calendars API
  async getCalendar(year: number, calendarNumber: number): Promise<any> {
    return this.makeRequest(`/calendars/${year}/${calendarNumber}`);
  }

  async listCalendars(year: number, limit: number = 50, offset: number = 0): Promise<any> {
    return this.makeRequest(`/calendars/${year}`, { limit, offset });
  }

  // Laws API
  async listLaws(): Promise<any> {
    return this.makeRequest('/laws');
  }

  async getLaw(lawId: string): Promise<any> {
    return this.makeRequest(`/laws/${lawId}`);
  }

  async searchLaws(term: string, lawId?: string, limit: number = 50, offset: number = 0): Promise<any> {
    const endpoint = lawId ? `/laws/${lawId}/search` : '/laws/search';
    return this.makeRequest(endpoint, { term, limit, offset });
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('NYS_LEGISLATION_API_KEY');
    if (!apiKey) {
      throw new Error('NYS_LEGISLATION_API_KEY not configured');
    }

    let action: string;
    let params: Record<string, any> = {};

    if (req.method === 'GET') {
      const url = new URL(req.url);
      action = url.searchParams.get('action') || '';
      
      // Convert URL search params to object
      for (const [key, value] of url.searchParams.entries()) {
        if (key !== 'action') {
          params[key] = value;
        }
      }
    } else {
      const body = await req.json();
      action = body.action;
      params = body.params || {};
    }
    
    if (!action) {
      throw new Error('Action parameter is required');
    }

    const client = new NYSApiClient(apiKey);
    let result;

    switch (action) {
      case 'getBill': {
        const sessionYear = parseInt(params.sessionYear || '2025');
        const printNo = params.printNo;
        if (!printNo) throw new Error('printNo parameter is required');
        result = await client.getBill(sessionYear, printNo);
        break;
      }

      case 'searchBills': {
        const term = params.term || '';
        const sessionYear = params.sessionYear ? parseInt(params.sessionYear) : undefined;
        const limit = parseInt(params.limit || '50');
        const offset = parseInt(params.offset || '0');
        result = await client.searchBills(term, sessionYear, limit, offset);
        break;
      }

      case 'getAgenda': {
        const year = parseInt(params.year || '2025');
        const agendaNo = parseInt(params.agendaNo || '1');
        const committeeName = params.committeeName || undefined;
        result = await client.getAgenda(year, agendaNo, committeeName);
        break;
      }

      case 'listAgendas': {
        const year = parseInt(params.year || '2025');
        const limit = parseInt(params.limit || '50');
        const offset = parseInt(params.offset || '0');
        result = await client.listAgendas(year, limit, offset);
        break;
      }

      case 'getCommitteeMeetings': {
        const fromDate = params.fromDate;
        const toDate = params.toDate;
        if (!fromDate || !toDate) throw new Error('fromDate and toDate parameters are required');
        result = await client.getCommitteeMeetings(fromDate, toDate);
        break;
      }

      case 'listMembers': {
        const sessionYear = parseInt(params.sessionYear || '2025');
        const chamber = params.chamber || undefined;
        const limit = parseInt(params.limit || '50');
        const offset = parseInt(params.offset || '0');
        result = await client.listMembers(sessionYear, chamber, limit, offset);
        break;
      }

      case 'searchMembers': {
        const term = params.term || '';
        const limit = parseInt(params.limit || '50');
        const offset = parseInt(params.offset || '0');
        result = await client.searchMembers(term, limit, offset);
        break;
      }

      case 'getMember': {
        const sessionYear = parseInt(params.sessionYear || '2025');
        const id = parseInt(params.id || '0');
        if (!id) throw new Error('id parameter is required');
        result = await client.getMember(sessionYear, id);
        break;
      }

      case 'listCalendars': {
        const year = parseInt(params.year || '2025');
        const limit = parseInt(params.limit || '50');
        const offset = parseInt(params.offset || '0');
        result = await client.listCalendars(year, limit, offset);
        break;
      }

      case 'getCalendar': {
        const year = parseInt(params.year || '2025');
        const calendarNumber = parseInt(params.calendarNumber || '1');
        result = await client.getCalendar(year, calendarNumber);
        break;
      }

      case 'listLaws': {
        result = await client.listLaws();
        break;
      }

      case 'getLaw': {
        const lawId = params.lawId;
        if (!lawId) throw new Error('lawId parameter is required');
        result = await client.getLaw(lawId);
        break;
      }

      case 'searchLaws': {
        const term = params.term || '';
        const lawId = params.lawId || undefined;
        const limit = parseInt(params.limit || '50');
        const offset = parseInt(params.offset || '0');
        result = await client.searchLaws(term, lawId, limit, offset);
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    console.error('NYS Legislation API Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
})