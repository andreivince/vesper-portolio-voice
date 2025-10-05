export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex h-64 w-64 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-lg">
        <video
          className="h-56 w-56 rounded-full object-cover"
          src="/icon.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    </main>
  );
}
