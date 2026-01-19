// Xbox button mapping order - D-pad is hardcoded as axes, not mapped as buttons
export const XBOX_BUTTONS = [
  { id: "a", label: "A", position: { x: 320, y: 180 }, type: "face" },
  { id: "b", label: "B", position: { x: 360, y: 140 }, type: "face" },
  { id: "x", label: "X", position: { x: 280, y: 140 }, type: "face" },
  { id: "y", label: "Y", position: { x: 320, y: 100 }, type: "face" },
  { id: "lb", label: "LB", position: { x: 120, y: 60 }, type: "shoulder" },
  { id: "rb", label: "RB", position: { x: 380, y: 60 }, type: "shoulder" },
  { id: "lt", label: "LT", position: { x: 120, y: 20 }, type: "trigger" },
  { id: "rt", label: "RT", position: { x: 380, y: 20 }, type: "trigger" },
  { id: "back", label: "Back", position: { x: 200, y: 120 }, type: "menu" },
  { id: "start", label: "Start", position: { x: 300, y: 120 }, type: "menu" },
  { id: "tl", label: "L3", position: { x: 140, y: 200 }, type: "stick" },
  { id: "tr", label: "R3", position: { x: 360, y: 200 }, type: "stick" },
];

export const XBOX_AXES = [
  {
    id: "x1",
    label: "Left Stick",
    direction: "Horizontal (Left/Right)",
    stick: "left",
  },
  {
    id: "y1",
    label: "Left Stick",
    direction: "Vertical (Up/Down)",
    stick: "left",
  },
  {
    id: "x2",
    label: "Right Stick",
    direction: "Horizontal (Left/Right)",
    stick: "right",
  },
  {
    id: "y2",
    label: "Right Stick",
    direction: "Vertical (Up/Down)",
    stick: "right",
  },
];
