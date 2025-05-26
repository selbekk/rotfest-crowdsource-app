import ThankYouCallout from "./components/ThankYouCallout";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-[rgb(237,219,181)]">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Takk for alt! 👋
        </h1>
        <ThankYouCallout />
      </div>
    </main>
  );
}
