import { PainTracker } from "./components/pain-tracker/index.tsx";

function App() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Pain & Injury Tracking System</h1>
      <PainTracker />
    </main>
  );
}

export default App;
