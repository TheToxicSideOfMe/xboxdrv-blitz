interface ButtonMapping {
  xboxButton: string;
  physicalButton: string;
}

interface AxisMapping {
  xboxAxis: string;
  physicalAxis: string;
}

interface CompletionScreenProps {
  buttonMappings: ButtonMapping[];
  axisMappings: AxisMapping[];
  buildXboxdrvCommand: () => string;
  restart: () => void;
  saveMapping: () => void;
}
export default function CompletionScreen({
  buttonMappings,
  axisMappings,
  buildXboxdrvCommand,
  restart,
  saveMapping,
}: CompletionScreenProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-green-500 bg-clip-text text-transparent">
        Mapping Complete!
      </h2>
      <p className="text-gray-400 mb-8">
        Your controller has been successfully configured
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-cyan-400 mb-1">
            {buttonMappings.length}
          </div>
          <div className="text-sm text-gray-400">Buttons Mapped</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {axisMappings.length}
          </div>
          <div className="text-sm text-gray-400">Axes Mapped</div>
        </div>
      </div>

      {/* Generated Command */}
      <div className="bg-gray-800/50 border border-cyan-500/30 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-3 text-cyan-400">
          Generated xboxdrv Command:
        </h3>
        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
          <pre className="whitespace-pre-wrap break-all">
            {buildXboxdrvCommand()}
          </pre>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Copy this command to test it manually in your terminal
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={restart}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all"
        >
          Start Over
        </button>
        <button
          onClick={saveMapping}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:scale-105 transition-all"
        >
          Save & Return
        </button>
      </div>
    </div>
  );
}
