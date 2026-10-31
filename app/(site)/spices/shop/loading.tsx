export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-ivory pb-24" aria-busy="true" aria-label="Loading products">
      <div className="h-72 bg-forest-deep" />
      <div className="container-lux mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-[1.25rem] border border-line bg-white">
            <div className="aspect-square animate-pulse bg-ivory-dark motion-reduce:animate-none" />
            <div className="space-y-3 p-5">
              <div className="h-6 w-3/4 animate-pulse rounded bg-ivory-dark motion-reduce:animate-none" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-ivory-dark motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
