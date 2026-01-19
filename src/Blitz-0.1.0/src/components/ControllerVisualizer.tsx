import { XBOX_BUTTONS } from "../constants/xbox_layout";

interface ButtonMapping {
  xboxButton: string;
  physicalButton: string;
}

interface Axis {
  id: string;
  label: string;
  direction: string;
  stick: string;
}

interface ControllerVisualizerProps {
  step: "buttons" | "axes" | "complete";
  currentButton: { id: string } | null;
  currentAxis: Axis | null;
  buttonMappings: ButtonMapping[];
}

export default function ControllerVisualizer({
  step,
  currentButton,
  currentAxis,
  buttonMappings,
}: ControllerVisualizerProps) {
  const getStickIndicator = () => {
    if (step !== "axes" || !currentAxis) return null;

    const isHorizontal = currentAxis.id.startsWith("x");
    const stick = currentAxis.stick;
    const cx = stick === "left" ? 140 : 360;
    const cy = 200;

    if (isHorizontal) {
      return (
        <>
          {/* Left arrow */}
          <path
            d={`M ${cx - 35} ${cy} L ${cx - 25} ${cy - 8} L ${cx - 25} ${
              cy + 8
            } Z`}
            fill="#06b6d4"
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0.8;0.3;0.8"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          {/* Right arrow */}
          <path
            d={`M ${cx + 35} ${cy} L ${cx + 25} ${cy - 8} L ${cx + 25} ${
              cy + 8
            } Z`}
            fill="#06b6d4"
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0.8;0.3;0.8"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </>
      );
    } else {
      return (
        <>
          {/* Up arrow */}
          <path
            d={`M ${cx} ${cy - 35} L ${cx - 8} ${cy - 25} L ${cx + 8} ${
              cy - 25
            } Z`}
            fill="#06b6d4"
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0.8;0.3;0.8"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          {/* Down arrow */}
          <path
            d={`M ${cx} ${cy + 35} L ${cx - 8} ${cy + 25} L ${cx + 8} ${
              cy + 25
            } Z`}
            fill="#06b6d4"
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0.8;0.3;0.8"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </>
      );
    }
  };
  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-8">
      <h3 className="text-lg font-semibold mb-6 text-center">
        Xbox Controller Layout
      </h3>

      <svg viewBox="0 0 500 300" className="w-full">
        {/* Controller Body */}
        <path
          d="M 100 150 Q 100 80, 150 80 L 350 80 Q 400 80, 400 150 Q 400 220, 350 220 L 150 220 Q 100 220, 100 150"
          fill="#1f2937"
          stroke="#374151"
          strokeWidth="2"
        />

        {/* Left Stick */}
        <circle
          cx="140"
          cy="200"
          r="30"
          fill="#374151"
          stroke="#4b5563"
          strokeWidth="2"
        />
        <circle
          cx="140"
          cy="200"
          r="20"
          fill={
            step === "axes" && currentAxis?.stick === "left"
              ? "#06b6d4"
              : "#1f2937"
          }
          className="transition-all duration-300"
        />

        {/* Right Stick */}
        <circle
          cx="360"
          cy="200"
          r="30"
          fill="#374151"
          stroke="#4b5563"
          strokeWidth="2"
        />
        <circle
          cx="360"
          cy="200"
          r="20"
          fill={
            step === "axes" && currentAxis?.stick === "right"
              ? "#06b6d4"
              : "#1f2937"
          }
          className="transition-all duration-300"
        />

        {/* Analog stick direction indicators */}
        {getStickIndicator()}

        {/* D-Pad - Now hardcoded, always shows as green (mapped) */}
        <g transform="translate(140, 140)">
          {/* Up */}
          <rect
            x="-10"
            y="-30"
            width="20"
            height="25"
            fill="#10b981"
            rx="3"
            className="transition-all duration-300"
          />
          {/* Down */}
          <rect
            x="-10"
            y="5"
            width="20"
            height="25"
            fill="#10b981"
            rx="3"
            className="transition-all duration-300"
          />
          {/* Left */}
          <rect
            x="-30"
            y="-10"
            width="25"
            height="20"
            fill="#10b981"
            rx="3"
            className="transition-all duration-300"
          />
          {/* Right */}
          <rect
            x="5"
            y="-10"
            width="25"
            height="20"
            fill="#10b981"
            rx="3"
            className="transition-all duration-300"
          />
        </g>

        {/* Face Buttons */}
        {XBOX_BUTTONS.filter((b) => b.type === "face").map((button) => (
          <g key={button.id}>
            <circle
              cx={button.position.x}
              cy={button.position.y}
              r="20"
              fill={
                step === "buttons" && currentButton?.id === button.id
                  ? "#06b6d4"
                  : buttonMappings.find((m) => m.xboxButton === button.id)
                  ? "#10b981"
                  : "#374151"
              }
              stroke="#4b5563"
              strokeWidth="2"
              className="transition-all duration-300"
            />
            <text
              x={button.position.x}
              y={button.position.y + 5}
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="bold"
            >
              {button.label}
            </text>
            {step === "buttons" && currentButton?.id === button.id && (
              <circle
                cx={button.position.x}
                cy={button.position.y}
                r="25"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  from="25"
                  to="35"
                  dur="1s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        ))}

        {/* Shoulder Buttons */}
        <rect
          x="100"
          y="60"
          width="60"
          height="25"
          rx="5"
          fill={
            step === "buttons" && currentButton?.id === "lb"
              ? "#06b6d4"
              : buttonMappings.find((m) => m.xboxButton === "lb")
              ? "#10b981"
              : "#374151"
          }
          className="transition-all duration-300"
        />
        <rect
          x="340"
          y="60"
          width="60"
          height="25"
          rx="5"
          fill={
            step === "buttons" && currentButton?.id === "rb"
              ? "#06b6d4"
              : buttonMappings.find((m) => m.xboxButton === "rb")
              ? "#10b981"
              : "#374151"
          }
          className="transition-all duration-300"
        />

        {/* Triggers */}
        <rect
          x="100"
          y="20"
          width="60"
          height="20"
          rx="3"
          fill={
            step === "buttons" && currentButton?.id === "lt"
              ? "#06b6d4"
              : buttonMappings.find((m) => m.xboxButton === "lt")
              ? "#10b981"
              : "#374151"
          }
          className="transition-all duration-300"
        />
        <rect
          x="340"
          y="20"
          width="60"
          height="20"
          rx="3"
          fill={
            step === "buttons" && currentButton?.id === "rt"
              ? "#06b6d4"
              : buttonMappings.find((m) => m.xboxButton === "rt")
              ? "#10b981"
              : "#374151"
          }
          className="transition-all duration-300"
        />

        {/* Start/Back */}
        <circle
          cx="200"
          cy="120"
          r="12"
          fill={
            step === "buttons" && currentButton?.id === "back"
              ? "#06b6d4"
              : buttonMappings.find((m) => m.xboxButton === "back")
              ? "#10b981"
              : "#374151"
          }
          className="transition-all duration-300"
        />
        <circle
          cx="300"
          cy="120"
          r="12"
          fill={
            step === "buttons" && currentButton?.id === "start"
              ? "#06b6d4"
              : buttonMappings.find((m) => m.xboxButton === "start")
              ? "#10b981"
              : "#374151"
          }
          className="transition-all duration-300"
        />
      </svg>

      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
          <span className="text-gray-400">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-400">Mapped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-600"></div>
          <span className="text-gray-400">Pending</span>
        </div>
      </div>
    </div>
  );
}
