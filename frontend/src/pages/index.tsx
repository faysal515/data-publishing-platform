import { fontClassName } from "../config/fonts";
import SEO from "../components/SEO";
import DragAndDrop from "../components/DragAndDrop";

export default function Home() {
  return (
    <div className={fontClassName}>
      <SEO />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Dataset Publishing Platform</h1>
        <main>
          <DragAndDrop />
        </main>
      </div>
    </div>
  );
}
