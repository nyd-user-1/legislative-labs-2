
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;
type Member = {
  people_id: number;
  name: string;
  party?: string;
  district?: string;
  chamber?: string;
};
type Committee = {
  committee_id: number;
  name: string;
  chamber: string;
  description?: string;
};

export interface EntityContext {
  type: 'bill' | 'member' | 'committee';
  bill?: Bill;
  member?: Member;
  committee?: Committee;
}

export class ContextBuilder {
  static buildPromptContext(
    entity: Bill | Member | Committee | null,
    entityType: 'bill' | 'member' | 'committee' | null,
    userPrompt: string
  ): string {
    if (!entity || !entityType) return userPrompt;

    let contextInfo = "";
    
    switch (entityType) {
      case 'bill':
        const bill = entity as Bill;
        contextInfo = `
BILL CONTEXT:
- Number: ${bill.bill_number || "Unknown"}
- Title: ${bill.title || "No title"}
- Status: ${bill.status_desc || "Unknown"}
- Last Action: ${bill.last_action || "None"}
- Committee: ${bill.committee || "Unknown"}
- Description: ${bill.description || "No description"}
        `;
        break;
        
      case 'member':
        const member = entity as Member;
        contextInfo = `
MEMBER CONTEXT:
- Name: ${member.name}
- Party: ${member.party || "Unknown"}
- District: ${member.district || "Unknown"}
- Chamber: ${member.chamber || "Unknown"}
        `;
        break;
        
      case 'committee':
        const committee = entity as Committee;
        contextInfo = `
COMMITTEE CONTEXT:
- Name: ${committee.name}
- Chamber: ${committee.chamber}
- Description: ${committee.description || "No description available"}
        `;
        break;
    }

    return `${contextInfo}

USER QUESTION: ${userPrompt}`;
  }

  static getEntityContext(
    entity: Bill | Member | Committee | null,
    entityType: 'bill' | 'member' | 'committee' | null
  ): EntityContext | null {
    if (!entity || !entityType) return null;

    const context: EntityContext = { type: entityType };
    
    switch (entityType) {
      case 'bill':
        context.bill = entity as Bill;
        break;
      case 'member':
        context.member = entity as Member;
        break;
      case 'committee':
        context.committee = entity as Committee;
        break;
    }

    return context;
  }

  static generateDynamicPrompts(
    entity: Bill | Member | Committee | null,
    entityType: 'bill' | 'member' | 'committee' | null,
    messageContent?: string
  ): string[] {
    const prompts: string[] = [];
    
    if (!entity || !entityType) {
      return ['More Details', 'Related Topics', 'Current Status'];
    }

    switch (entityType) {
      case 'bill':
        const bill = entity as Bill;
        prompts.push(
          `Analyze fiscal impact of ${bill.bill_number}`,
          `Find similar bills to ${bill.bill_number}`,
          `Explain voting record on ${bill.bill_number}`
        );
        if (bill.committee) {
          prompts.push(`Committee analysis for ${bill.committee}`);
        }
        break;
        
      case 'member':
        const member = entity as Member;
        prompts.push(
          `${member.name}'s recent legislation`,
          `${member.name}'s voting patterns`,
          `Committee roles for ${member.name}`
        );
        if (member.party) {
          prompts.push(`${member.party} party alignment`);
        }
        break;
        
      case 'committee':
        const committee = entity as Committee;
        prompts.push(
          `Recent ${committee.name} activity`,
          `Key members of ${committee.name}`,
          `Bills in ${committee.name} pipeline`
        );
        break;
    }

    // Add contextual prompts based on message content
    if (messageContent) {
      const lowerContent = messageContent.toLowerCase();
      if (lowerContent.includes('fiscal') || lowerContent.includes('budget')) {
        prompts.push('Budget implications');
      }
      if (lowerContent.includes('vote') || lowerContent.includes('support')) {
        prompts.push('Stakeholder positions');
      }
      if (lowerContent.includes('timeline') || lowerContent.includes('schedule')) {
        prompts.push('Legislative timeline');
      }
    }

    return prompts.slice(0, 3); // Return top 3 most relevant
  }
}
