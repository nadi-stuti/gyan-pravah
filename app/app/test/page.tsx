import { fetchFromStrapi } from "@/lib/strapi";

export default async function TestPage() {
  const data = await fetchFromStrapi("/quiz-topics");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Strapi Connection Test</h1>
      <pre className=" p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
