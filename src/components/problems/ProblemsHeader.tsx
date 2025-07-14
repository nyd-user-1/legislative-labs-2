
interface ProblemsHeaderProps {
  problemsCount: number;
}

export const ProblemsHeader = ({ problemsCount }: ProblemsHeaderProps) => {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-gray-900">Problem Chats</h1>
      <p className="text-gray-600">
        Manage and track your problem statements and their development progress.
        {problemsCount > 0 && (
          <span className="ml-1">
            ({problemsCount.toLocaleString()} problem{problemsCount !== 1 ? 's' : ''})
          </span>
        )}
      </p>
    </div>
  );
};
