function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-pink-200 flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">
        React + TypeScript + Tailwind CSS + Vite Template
      </h1>
      <p className="text-xl text-gray-800 mb-8 mx-auto max-w-3xl text-center">
        Kickstart your project with this pre-configured starter template.
      </p>
      <div className="flex space-x-6">
        <a 
          href="https://react.dev" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          target="_blank" 
          rel="noreferrer"
        >
          React Docs
        </a>
        <a 
          href="https://vitejs.dev" 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          target="_blank" 
          rel="noreferrer"
        >
          Vite Docs
        </a>
        <a 
          href="https://tailwindcss.com" 
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          target="_blank" 
          rel="noreferrer"
        >
          Tailwind CSS Docs
        </a>
      </div>
    </div>
  );
}

export default App;
