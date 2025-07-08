import { CommitteeCard } from "./CommitteeCard";
import { NYSMember } from "@/types/nysApi";

type EnhancedCommittee = {
  name: string;
  memberCount: number;
  billCount: number;
  description?: string;
  chair_name?: string;
  ranking_member_name?: string;
  committee_type: string;
  chamber: string;
  meetingDateTime?: string;
  location?: string;
  agendaNo?: number;
  year?: number;
  members?: NYSMember[];
  upcomingMeetings?: Array<{
    date: string;
    location: string;
    agenda: any;
  }>;
};

interface CommitteesGridProps {
  committees: EnhancedCommittee[];
  onCommitteeSelect: (committee: EnhancedCommittee) => void;
}

export const CommitteesGrid = ({ committees, onCommitteeSelect }: CommitteesGridProps) => {
  return (
    <section className="grid-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {committees.map((committee) => (
        <CommitteeCard
          key={committee.name}
          committee={committee}
          onCommitteeSelect={onCommitteeSelect}
        />
      ))}
    </section>
  );
};