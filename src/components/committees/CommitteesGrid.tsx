import { CommitteeCard } from "./CommitteeCard";

type Committee = {
  committee_id: number;
  name: string;
  memberCount: string;
  billCount: string;
  description?: string;
  chair_name?: string;
  chair_email?: string;
  chamber: string;
  committee_url?: string;
  meeting_schedule?: string;
  next_meeting?: string;
  upcoming_agenda?: string;
  address?: string;
  slug?: string;
};

interface CommitteesGridProps {
  committees: Committee[];
  onCommitteeSelect: (committee: Committee) => void;
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