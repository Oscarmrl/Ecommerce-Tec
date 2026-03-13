export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-10 w-64 bg-surface-2 rounded-lg mb-2 animate-pulse"></div>
        <div className="h-5 w-96 bg-surface-2 rounded animate-pulse"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters skeleton */}
        <div className="lg:w-1/4">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-surface-2 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Products grid skeleton */}
        <div className="lg:w-3/4">
          <div className="mb-6 flex justify-between items-center">
            <div className="h-6 w-32 bg-surface-2 rounded animate-pulse"></div>
            <div className="h-10 w-48 bg-surface-2 rounded-lg animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border border-soft rounded-xl overflow-hidden">
                <div className="aspect-square bg-surface-2 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-surface-2 rounded animate-pulse"></div>
                  <div className="h-4 bg-surface-2 rounded animate-pulse"></div>
                  <div className="h-6 w-24 bg-surface-2 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}