import ImageUpload from "./components/image-upload"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Rotfest Bildegalleri</h1>
        <p className="text-center mb-8 text-gray-600">
          Last opp ditt bilde fra Bekk sin 25-årsfeiring i Vrådal. Bildet vil bli behandlet med AI for å legge til
          nasjonalromantiske elementer.
        </p>
        <ImageUpload />
        <div className="mt-8 text-center">
          <a href="/gallery" className="text-blue-600 hover:underline">
            Se alle bilder i galleriet →
          </a>
        </div>
      </div>
    </main>
  )
}
