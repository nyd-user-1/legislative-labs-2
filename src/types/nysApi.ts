// NYS OpenLegislation API Type Definitions

export interface NYSApiResponse<T> {
  success: boolean;
  message: string;
  responseType: string;
  result?: T;
  errorCode?: number;
  errorData?: any;
}

export interface NYSBill {
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
        coSponsors: { items: NYSMember[] };
      }
    };
  };
  votes?: { items: NYSVote[] };
  actions: { items: NYSAction[] };
}

export interface NYSAction {
  actionDate: string;
  chamber: string;
  actionType: string;
  actionDesc: string;
  billId: {
    basePrintNo: string;
    session: number;
    printNo: string;
  };
  sequence: number;
}

export interface NYSVote {
  voteId: number;
  voteDate: string;
  voteType: string;
  chamber: string;
  committee?: string;
  version: string;
  memberVotes: {
    items: Array<{
      memberId: number;
      shortName: string;
      vote: "AYE" | "NAY" | "ABSENT" | "ABSTAIN" | "EXCUSED";
    }>;
  };
}

export interface NYSMember {
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

export interface NYSCommittee {
  name: string;
  chamber: "SENATE" | "ASSEMBLY" | "JOINT";
  chair?: {
    memberId: number;
    shortName: string;
    fullName: string;
  };
  members?: {
    items: Array<{
      member: NYSMember;
      majority: boolean;
      title: string;
    }>;
  };
  location?: string;
  meetingDateTime?: string;
  session: number;
}

export interface NYSAgenda {
  year: number;
  agendaNo: number;
  committeeId: {
    name: string;
    chamber: string;
  };
  weekOf: string;
  addendum?: string;
  meeting?: {
    meetingDateTime: string;
    location: string;
    notes: string;
  };
  bills: {
    items: Array<{
      billId: {
        basePrintNo: string;
        session: number;
        printNo: string;
      };
      billCalNo: string;
      high: boolean;
    }>;
  };
}

export interface NYSCalendar {
  year: number;
  calNo: number;
  calDate: string;
  releaseDateTime: string;
  entries: {
    items: Array<{
      billCalNo: number;
      billId: {
        basePrintNo: string;
        session: number;
        printNo: string;
      };
      selectedVersion: string;
      high: boolean;
    }>;
  };
  supplementalEntries?: {
    items: Array<{
      sectionType: string;
      billCalNo: number;
      billId: {
        basePrintNo: string;
        session: number;
        printNo: string;
      };
    }>;
  };
}

export interface NYSLaw {
  lawId: string;
  name: string;
  lawType: "CONSOLIDATED" | "UNCONSOLIDATED" | "COURT_ACTS" | "MISC";
  chapters: {
    items: Array<{
      chapterId: string;
      name: string;
      articles: {
        items: Array<{
          articleId: string;
          name: string;
          sections: {
            items: Array<{
              sectionId: string;
              sectionNum: string;
              title: string;
              text: string;
            }>;
          };
        }>;
      };
    }>;
  };
}

export interface NYSSearchResult<T> {
  total: number;
  offsetStart: number;
  offsetEnd: number;
  limit: number;
  result: {
    items: T[];
  };
}

// API Client Interfaces
export interface NYSApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface SearchParams {
  term: string;
  sort?: string;
  limit?: number;
  offset?: number;
  full?: boolean;
}

export interface DateRange {
  fromDate: string;
  toDate: string;
}