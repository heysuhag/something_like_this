import Canvas from "./components/Canvas";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <header className="px-6 py-4 border-b border-zinc-200">
        <h1 className="text-xl font-semibold">Something Like This</h1>
        <p className="text-sm text-zinc-600">
          Sketch a rough idea below — later you can hand it to a model to riff
          on.
        </p>
      </header>

      <div className="flex-1 min-h-0">
        <Canvas />
      </div>
    </div>
  );
}
