export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 py-8">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-28 animate-pulse border border-hairline bg-surface"
        />
      ))}
    </main>
  );
}
