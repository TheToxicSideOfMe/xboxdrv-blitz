interface ControllerConfig {
  name: string;
  button_mappings: Array<{ xbox_button: string; physical_button: string }>;
  axis_mappings: Array<{ xbox_axis: string; physical_axis: string }>;
}

interface ConfigSelectionModalProps {
  isOpen: boolean;
  controllerName: string;
  configs: ControllerConfig[];
  onClose: () => void;
  onSelectConfig: (config: ControllerConfig) => void;
  onCreateNew: () => void;
  onDeleteConfig: (configName: string) => void;
}

export default function ConfigSelectionModal({
  isOpen,
  controllerName,
  configs,
  onClose,
  onSelectConfig,
  onCreateNew,
  onDeleteConfig,
}: ConfigSelectionModalProps) {
  if (!isOpen) return null;

  // Find matching configs (configs that have the same controller name)
  const matchingConfigs = configs.filter((c) => c.name === controllerName);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-cyan-500/30 rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-1">
              {matchingConfigs.length > 0
                ? "Select Configuration"
                : "No Configuration Found"}
            </h2>
            <p className="text-gray-400 text-sm">{controllerName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {matchingConfigs.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-300 mb-4">
              Found {matchingConfigs.length} saved configuration
              {matchingConfigs.length !== 1 ? "s" : ""} for this controller:
            </p>

            {matchingConfigs.map((config) => (
              <div
                key={config.name}
                className="w-full p-4 bg-gray-800/50 hover:bg-cyan-500/10 border border-gray-700 hover:border-cyan-500/50 rounded-lg transition-all group text-left flex items-center justify-between"
              >
                <button
                  onClick={() => onSelectConfig(config)}
                  className="flex-grow flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors mb-2">
                      {config.name}
                    </h3>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>{config.button_mappings.length} buttons mapped</span>
                      <span>{config.axis_mappings.length} axes mapped</span>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-600 group-hover:text-cyan-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteConfig(config.name)}
                  className="ml-4 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                  title="Delete Configuration"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}

            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={onCreateNew}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Configuration
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-gray-300 mb-6">
              No saved configuration found for this controller. You'll need to
              create one before you can use it.
            </p>
            <button
              onClick={onCreateNew}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold shadow-lg hover:scale-105 transition-all"
            >
              Create Configuration Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
