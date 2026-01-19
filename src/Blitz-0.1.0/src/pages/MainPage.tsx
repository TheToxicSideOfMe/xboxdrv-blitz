import { toast } from "react-hot-toast";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";
import ConfigSelectionModal from "../components/ConfigSelectionModal";
import ControllerList from "../components/ControllerList";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useEffect, useState } from "react";

interface Controller {
  id: string;
  name: string;
  event: string;
  isRunning: boolean;
}

interface ControllerConfig {
  name: string;
  button_mappings: Array<{ xbox_button: string; physical_button: string }>;
  axis_mappings: Array<{ xbox_axis: string; physical_axis: string }>;
}

export default function MainPage() {
  const navigate = useNavigate();
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [allConfigs, setAllConfigs] = useState<ControllerConfig[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedController, setSelectedController] = useState<{
    id: string;
    name: string;
    event: string;
  } | null>(null);

  const loadAllConfigs = async () => {
    try {
      const configs = await invoke<ControllerConfig[]>("get_all_configs");
      setAllConfigs(configs);
    } catch (err) {
      console.error("Failed to load configs:", err);
      toast.error("Failed to load configs");
    }
  };

  const discoverControllers = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const result = await invoke<string>("discover_controllers");
      const lines = result
        .trim()
        .split("\n")
        .filter((line) => line.length > 0);

      const parsedControllers: Controller[] = lines.map((line, index) => {
        const match = line.match(/\/dev\/input\/(event\d+):\s*(.+)/);

        if (match) {
          const eventName = match[1];
          const existingController = controllers.find(
            (c) => c.event === eventName
          );

          return {
            id: String(index + 1),
            name: match[2].trim(),
            event: eventName,
            isRunning: existingController ? existingController.isRunning : false,
          };
        }

        return {
          id: String(index + 1),
          name: line,
          event: "unknown",
          isRunning: false,
        };
      });

      setControllers(parsedControllers);
      setIsScanning(false);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to discover controllers: " + err);
      toast.error("Failed to discover controllers");
      setIsScanning(false);
    }
  };

  const handleStartController = async (controllerId: string) => {
    const controller = controllers.find((c) => c.id === controllerId);
    if (!controller) return;

    // Open modal to select config
    setSelectedController({
      id: controller.id,
      name: controller.name,
      event: controller.event,
    });
    setIsModalOpen(true);
  };

  const startControllerWithConfig = async () => {
    if (!selectedController) return;

    try {
      // Start xboxdrv with the selected config
      await invoke("start_xboxdrv", {
        controllerEvent: selectedController.event,
      });

      setControllers(
        controllers.map((c) =>
          c.id === selectedController.id ? { ...c, isRunning: true } : c
        )
      );

      toast.success(`Started controller: ${selectedController.name}`);
      setIsModalOpen(false);
      setSelectedController(null);
    } catch (err) {
      setError("Failed to start xboxdrv: " + err);
      toast.error("Failed to start xboxdrv");
    }
  };

  const createNewConfig = () => {
    if (!selectedController) return;

    setIsModalOpen(false);
    navigate(`/map/${selectedController.id}?event=${selectedController.event}`);
  };

  const stopController = async (controllerId: string) => {
    try {
      const controller = controllers.find((c) => c.id === controllerId);
      if (!controller) return;

      await invoke("stop_xboxdrv", { controllerEvent: controller.event });

      setControllers(
        controllers.map((c) =>
          c.id === controllerId ? { ...c, isRunning: false } : c
        )
      );
      toast.success(`Stopped controller: ${controller.name}`);
    } catch (err) {
      setError("Failed to stop xboxdrv: " + err);
      toast.error("Failed to stop xboxdrv");
    }
  };

  const handleConfigure = (controllerId: string) => {
    const controller = controllers.find((c) => c.id === controllerId);
    if (controller) {
      navigate(`/map/${controllerId}?event=${controller.event}`);
    }
  };

  const handleDeleteConfig = async (configName: string) => {
    try {
      await invoke("delete_controller_config", { controllerName: configName });
      loadAllConfigs(); // Refresh the list of configs
      toast.success(`Configuration "${configName}" deleted successfully.`);
    } catch (err) {
      console.error("Failed to delete config:", err);
      setError("Failed to delete config: " + err);
      toast.error("Failed to delete config");
    }
  };

  useEffect(() => {
    discoverControllers();
    loadAllConfigs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <ConfigSelectionModal
        isOpen={isModalOpen}
        controllerName={selectedController?.name || ""}
        configs={allConfigs}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedController(null);
        }}
        onSelectConfig={startControllerWithConfig}
        onCreateNew={createNewConfig}
        onDeleteConfig={handleDeleteConfig}
      />

      <Header allConfigs={allConfigs.length} controllers={controllers.length} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Scan Button */}
        <div className="mb-8">
          <button
            onClick={discoverControllers}
            disabled={isScanning}
            className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="flex items-center gap-2">
              {isScanning ? (
                <>
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
                  Scanning...
                </>
              ) : (
                <>
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Discover Controllers
                </>
              )}
            </div>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Controllers List */}
        {controllers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-600"
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
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Controllers Found
            </h3>
            <p className="text-gray-500 text-sm">
              Click "Discover Controllers" to scan for connected devices
            </p>
          </div>
        ) : (
          <ControllerList
            controllers={controllers}
            handleConfigure={handleConfigure}
            stopController={stopController}
            handleStartController={handleStartController}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}