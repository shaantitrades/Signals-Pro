export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted" />
        <div className="w-40 h-5 rounded bg-muted" />
        <div className="w-64 h-3 rounded bg-muted mt-2" />
      </div>
    </div>
  );
}
