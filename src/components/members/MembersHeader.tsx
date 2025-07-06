interface MembersHeaderProps {
  membersCount: number;
  chambersCount: number;
}

export const MembersHeader = ({ membersCount, chambersCount }: MembersHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        Members
      </h1>
      <p className="text-lg text-muted-foreground">
        Connect with elected officials and their contact information
      </p>
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span>{membersCount} members found</span>
        <span>•</span>
        <span>{chambersCount} chambers</span>
      </div>
    </div>
  );
};