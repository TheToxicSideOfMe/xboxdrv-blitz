import ControllerListItem from "./ControllerListItem";

interface Controller {
  id: string;
  name: string;
  event: string;
  isRunning: boolean;
}

interface ControllerListProps {
  controllers: Controller[];
  handleConfigure: (controllerId: string) => void;
  stopController: (controllerId: string) => void;
  handleStartController: (controllerId: string) => void;
}

export default function ControllerList({
  controllers,
  handleConfigure,
  stopController,
  handleStartController,
}: ControllerListProps) {
  return (
    <div className="grid gap-4">
      {controllers.map((controller) => (
        <ControllerListItem
          key={controller.id}
          controller={controller}
          handleConfigure={handleConfigure}
          stopController={stopController}
          handleStartController={handleStartController}
        />
      ))}
    </div>
  );
}
