import { getQuizSubtopics, getQuizTopics } from "@/lib/quiz";

export default async function QuizTopicsPage() {
  const { data: topics } = await getQuizSubtopics("2");

  // Basic list—design upgrades later
  return (
    <div>
      <h1>Quiz</h1>
      <ul>
        {topics.map((topic) => (
          <li className="p-8" key={topic.id}>
            <h1 className="text-2xl font-bold mb-4">documentId: {topic.documentId}</h1>
            <pre className=" p-4 rounded">
              {JSON.stringify(topics, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
