
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface RoleSelectorProps {
  selectedRole: string;
  onChange: (role: string) => void;
  disabled?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-3">
      <Label>I want to:</Label>
      <RadioGroup
        value={selectedRole}
        onValueChange={onChange}
        className="flex flex-col space-y-3"
        disabled={disabled}
      >
        <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent">
          <RadioGroupItem value="worker" id="worker-role" />
          <Label htmlFor="worker-role" className="flex flex-col cursor-pointer">
            <span className="font-medium">Complete Tasks</span>
            <span className="text-sm text-muted-foreground">Earn money by working on microtasks</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent">
          <RadioGroupItem value="client" id="client-role" />
          <Label htmlFor="client-role" className="flex flex-col cursor-pointer">
            <span className="font-medium">Post Tasks</span>
            <span className="text-sm text-muted-foreground">Create and manage AI-verified microtasks</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default RoleSelector;
