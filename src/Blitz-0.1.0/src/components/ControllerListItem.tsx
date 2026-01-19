interface Controller {
  id: string;
  name: string;
  event: string;
  isRunning: boolean;
}

interface ControllerListItemProps {
  controller: Controller;
  handleConfigure: (controllerId: string) => void;
  stopController: (controllerId: string) => void;
  handleStartController: (controllerId: string) => void;
}

export default function ControllerListItem({
  controller,
  handleConfigure,
  stopController,
  handleStartController,
}: ControllerListItemProps) {
  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">{controller.name}</h3>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>/dev/input/{controller.event}</span>
              {controller.isRunning && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Running
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleConfigure(controller.id)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-all"
          >
            Configure
          </button>
          {controller.isRunning ? (
            <button
              onClick={() => stopController(controller.id)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-sm font-medium text-red-400 transition-all"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => handleStartController(controller.id)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-sm font-semibold shadow-lg hover:scale-105 transition-all"
            >
              Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
