interface CommitteesHeaderProps {
  committeesCount: number;
}

export const CommitteesHeader = ({ committeesCount }: CommitteesHeaderProps) => {
  return (
    <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Committees
          </h1>
          <p className="text-base sm:text-lg text-gray-600 break-words">
            Explore New York State legislative committees and their activities
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="bg-brand-50 border border-brand-200 rounded-lg px-4 py-2">
            <div className="text-sm text-brand-600 font-medium">
              Total Committees
            </div>
            <div className="text-2xl font-bold text-brand-900">
              {committeesCount}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};