interface CommitteesHeaderProps {
  committeesCount: number;
}

export const CommitteesHeader = ({ committeesCount }: CommitteesHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        Committees
      </h1>
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span>{committeesCount} committees found</span>
      </div>
    </div>
  );
};