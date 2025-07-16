
export interface LegiscanBill {
  bill_id: number;
  bill_number: string;
  title: string;
  description: string;
  state: string;
  state_id: number;
  session_id: number;
  session_name: string;
  url: string;
  state_link: string;
  text_url: string;
  research_url: string;
  last_action_date: string;
  last_action: string;
  status: number;
  status_date: string;
}

export interface LegiscanSearchResult {
  status: string;
  searchresult: {
    summary: {
      count: number;
      page: number;
      relevancy: number;
    };
    results?: LegiscanBill[];
  };
}

export interface LegiscanSession {
  session_id: number;
  state_id: number;
  year_start: number;
  year_end: number;
  name: string;
  title: string;
  type: number;
  special: number;
}

export interface LegiscanSessionList {
  status: string;
  sessions: LegiscanSession[];
}

export interface LegiscanSearchParams {
  query?: string;
  state?: string;
  year?: number;
  page?: number;
}

export interface LegiscanApiParams {
  operation: 'search' | 'getSessionList' | 'getBill' | 'getBillText';
  params?: Record<string, any>;
}
