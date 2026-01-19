import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { invoke } from "@tauri-apps/api/core";
import { XBOX_BUTTONS, XBOX_AXES } from "../constants/xbox_layout";
import CompletionScreen from "../components/CompletionScreen";
import ControllerVisualizer from "../components/ControllerVisualizer";
import MappingInstructions from "../components/MappingInstructions";

interface ButtonMapping {
  xboxButton: string;
  physicalButton: string;
}

interface AxisMapping {
  xboxAxis: string;
  physicalAxis: string;
}

function MapController() {
  const { controllerId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState<"buttons" | "axes" | "complete">("buttons");
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);
  const [currentAxisIndex, setCurrentAxisIndex] = useState(0);
  const [buttonMappings, setButtonMappings] = useState<ButtonMapping[]>([]);
  const [axisMappings, setAxisMappings] = useState<AxisMapping[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [detectedInput, setDetectedInput] = useState<string>("");

  const [searchParams] = useSearchParams();

  // Get the controller event from URL query parameter
  const controllerEvent = searchParams.get("event") || "event13";

  const currentButton =
    step === "buttons" ? XBOX_BUTTONS[currentButtonIndex] : null;
  const currentAxis = step === "axes" ? XBOX_AXES[currentAxisIndex] : null;

  const listenForInput = async () => {
    setIsListening(true);
    setDetectedInput("");

    try {
      const eventPath = `/dev/input/${controllerEvent}`;

      let result;
      if (step === "buttons") {
        result = await invoke<string>("listen_for_button", { eventPath });
      } else {
        // For axes, use the axis listener
        result = await invoke<string>("listen_for_axis", { eventPath });
      }

      setDetectedInput(result);

      if (step === "buttons" && currentButton) {
        handleButtonMapped(result);
      } else if (step === "axes" && currentAxis) {
        handleAxisMapped(result);
      }

      setIsListening(false);
    } catch (err) {
      console.error("Failed to listen for input:", err);
      toast.error("Failed to listen for input");
      setIsListening(false);
    }
  };

  const handleButtonMapped = (physicalButton: string) => {
    if (!currentButton) return;

    setButtonMappings([
      ...buttonMappings,
      { xboxButton: currentButton.id, physicalButton },
    ]);

    if (currentButtonIndex < XBOX_BUTTONS.length - 1) {
      setCurrentButtonIndex(currentButtonIndex + 1);
    } else {
      setStep("axes");
      setCurrentAxisIndex(0);
    }
  };

  const handleAxisMapped = (physicalAxis: string) => {
    if (!currentAxis) return;

    setAxisMappings([
      ...axisMappings,
      { xboxAxis: currentAxis.id, physicalAxis },
    ]);

    if (currentAxisIndex < XBOX_AXES.length - 1) {
      setCurrentAxisIndex(currentAxisIndex + 1);
    } else {
      setStep("complete");
    }
  };

  const skipButton = () => {
    if (step === "buttons" && currentButtonIndex < XBOX_BUTTONS.length - 1) {
      setCurrentButtonIndex(currentButtonIndex + 1);
    } else if (step === "buttons") {
      setStep("axes");
      setCurrentAxisIndex(0);
    } else if (step === "axes" && currentAxisIndex < XBOX_AXES.length - 1) {
      setCurrentAxisIndex(currentAxisIndex + 1);
    } else {
      setStep("complete");
    }
  };

  const saveMapping = async () => {
    try {
      await invoke("save_controller_config", {
        controllerEvent,
        buttonMappings: buttonMappings.map((m) => ({
          xbox_button: m.xboxButton,
          physical_button: m.physicalButton,
        })),
        axisMappings: axisMappings.map((m) => ({
          xbox_axis: m.xboxAxis,
          physical_axis: m.physicalAxis,
        })),
      });
      toast.success("Configuration saved successfully!");
      // Success! Navigate back to main page
      navigate("/");
    } catch (err) {
      console.error("Failed to save config:", err);
      toast.error("Failed to save configuration");
    }
  };

  const restart = () => {
    setStep("buttons");
    setCurrentButtonIndex(0);
    setCurrentAxisIndex(0);
    setButtonMappings([]);
    setAxisMappings([]);
  };

  const buildXboxdrvCommand = () => {
    // Build button mapping string
    const buttonMap = buttonMappings
      .map((m) => `${m.physicalButton}=${m.xboxButton}`)
      .join(",");

    // Build axis mapping string
    const axisMap = axisMappings
      .map((m) => `${m.physicalAxis}=${m.xboxAxis}`)
      .join(",");

    // Build the full command - note the order matters!
    let cmd = `sudo xboxdrv --evdev /dev/input/${controllerEvent}`;

    // Add axis mappings + hardcoded D-pad (D-pad is always ABS_HAT0X and ABS_HAT0Y)
    if (axisMap) {
      cmd += ` \\\n  --evdev-absmap ${axisMap},ABS_HAT0X=dpad_x,ABS_HAT0Y=dpad_y`;
    } else {
      cmd += ` \\\n  --evdev-absmap ABS_HAT0X=dpad_x,ABS_HAT0Y=dpad_y`;
    }

    cmd += ` \\\n  --axismap -Y1=Y1,-Y2=Y2`;

    if (buttonMap) {
      cmd += ` \\\n  --evdev-keymap ${buttonMap}`;
    }

    cmd += ` \\\n  --mimic-xpad --silent`;

    return cmd;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>
            <div className="text-right">
              <h1 className="text-xl font-bold text-cyan-400">
                Configure Controller
              </h1>
              <p className="text-xs text-gray-500">
                Controller #{controllerId}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {step === "complete" ? (
          // Completion Screen
          <CompletionScreen
            buttonMappings={buttonMappings}
            axisMappings={axisMappings}
            buildXboxdrvCommand={buildXboxdrvCommand}
            restart={restart}
            saveMapping={saveMapping}
          />
        ) : (
          // Mapping Screen
          <div className="max-w-5xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-400">
                  {step === "buttons"
                    ? `Button ${currentButtonIndex + 1} of ${
                        XBOX_BUTTONS.length
                      }`
                    : `Axis ${currentAxisIndex + 1} of ${XBOX_AXES.length}`}
                </span>
                <span className="text-sm font-medium text-cyan-400">
                  {step === "buttons"
                    ? Math.round(
                        (currentButtonIndex / XBOX_BUTTONS.length) * 100
                      )
                    : Math.round(
                        (currentAxisIndex / XBOX_AXES.length) * 100
                      )}
                  %
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 ease-out"
                  style={{
                    width:
                      step === "buttons"
                        ? `${
                            (currentButtonIndex / XBOX_BUTTONS.length) * 100
                          }%`
                        : `${(currentAxisIndex / XBOX_AXES.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Controller Visual */}
              <ControllerVisualizer
                step={step}
                currentButton={currentButton}
                currentAxis={currentAxis}
                buttonMappings={buttonMappings}
              />
              {/* Right: Instructions */}
              <MappingInstructions
                step={step}
                currentButton={currentButton}
                currentAxis={currentAxis}
                detectedInput={detectedInput}
                isListening={isListening}
                listenForInput={listenForInput}
                skipButton={skipButton}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MapController;