export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6">
          🚀 Next.js Starter Template
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Your project is successfully set up. This is a dummy home page to
          verify routing, styling, and deployment.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <FeatureCard
            title="App Router Ready"
            description="Using the modern Next.js app directory structure."
          />
          <FeatureCard
            title="TypeScript Enabled"
            description="Strict typing so future you doesn't hate present you."
          />
          <FeatureCard
            title="Tailwind Installed"
            description="Rapid UI building without writing 4000 lines of CSS."
          />
          <FeatureCard
            title="Scalable Structure"
            description="Perfect base for dashboards, SaaS, or internal tools."
          />
        </div>

        <div className="mt-12 p-6 bg-white rounded-2xl shadow">
          <h2 className="text-2xl font-semibold mb-3">Next Steps</h2>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>Create pages inside <code>/app</code></li>
            <li>Connect your backend API</li>
            <li>Add authentication</li>
            <li>Ship something cool ✨</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

type FeatureProps = {
  title: string;
  description: string;
};

function FeatureCard({ title, description }: FeatureProps) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow hover:shadow-md transition">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}