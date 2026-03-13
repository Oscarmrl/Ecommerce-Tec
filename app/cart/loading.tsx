export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-10 w-64 bg-surface-2 rounded-lg mb-2 animate-pulse"></div>
        <div className="h-5 w-96 bg-surface-2 rounded animate-pulse"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items skeleton */}
        <div className="lg:w-2/3">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-soft rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 bg-surface-2 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-48 bg-surface-2 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-surface-2 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 w-24 bg-surface-2 rounded animate-pulse"></div>
                    <div className="h-10 w-32 bg-surface-2 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary skeleton */}
        <div className="lg:w-1/3">
          <div className="border border-soft rounded-xl p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-5 w-32 bg-surface-2 rounded animate-pulse"></div>
                <div className="h-5 w-24 bg-surface-2 rounded animate-pulse"></div>
              </div>
            ))}
            <div className="pt-4 border-t border-soft">
              <div className="flex justify-between">
                <div className="h-6 w-24 bg-surface-2 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-surface-2 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-12 bg-surface-2 rounded-lg animate-pulse mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}