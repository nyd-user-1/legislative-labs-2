import { CommitteeCard } from "./CommitteeCard";

type Committee = {
  name: string;
  memberCount: number;
  billCount: number;
  description?: string;
  chair_name?: string;
  ranking_member_name?: string;
  committee_type: string;
  chamber: string;
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