interface MappingInstructionsProps {
  step: "buttons" | "axes" | "complete";
  currentButton: { label: string } | null;
  currentAxis: { label: string; direction: string } | null;
  detectedInput: string;
  isListening: boolean;
  listenForInput: () => void;
  skipButton: () => void;
}
export default function MappingInstructions({
  step,
  currentButton,
  currentAxis,
  detectedInput,
  isListening,
  listenForInput,
  skipButton,
}: MappingInstructionsProps) {
  return (
    <div className="flex flex-col justify-center">
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-xl p-8 mb-6">
        <div className="text-6xl mb-4 text-center">
          {step === "buttons" ? "🎮" : "🕹️"}
        </div>

        <h2 className="text-2xl font-bold mb-4 text-center">
          {step === "buttons"
            ? `Press ${currentButton?.label}`
            : `Move ${currentAxis?.label}`}
        </h2>

        <p className="text-gray-400 text-center mb-6">
          {step === "buttons"
            ? `Press the ${currentButton?.label} button on your physical controller`
            : `Move your ${currentAxis?.label} ${currentAxis?.direction}`}
        </p>

        {detectedInput && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 text-center">
            <p className="text-green-400 font-semibold">
              Detected: {detectedInput}
            </p>
          </div>
        )}

        <button
          onClick={listenForInput}
          disabled={isListening}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isListening ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Listening...
            </span>
          ) : (
            "Start Listening"
          )}
        </button>
      </div>

      <button
        onClick={skipButton}
        className="w-full py-3 bg-gray-700/50 border border-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-all"
      >
        Skip This {step === "buttons" ? "Button" : "Axis"}
      </button>
    </div>
  );
}
