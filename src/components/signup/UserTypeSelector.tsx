
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface UserTypeSelectorProps {
  selectedUserType: string;
  onChange: (userType: string) => void;
  disabled?: boolean;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  selectedUserType,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="user-type">I am a:</Label>
      <Select
        value={selectedUserType}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id="user-type" className="w-full">
          <SelectValue placeholder="Select your user type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="worker">Worker (Complete Tasks)</SelectItem>
          <SelectItem value="employer">Employer (Post Tasks)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserTypeSelector;
