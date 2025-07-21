
import { Palette } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useColorScheme } from '@/contexts/ColorSchemeContext';

interface ColorSchemeToggleProps {
  collapsed: boolean;
}

export const ColorSchemeToggle: React.FC<ColorSchemeToggleProps> = ({ collapsed }) => {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors">
      <Palette className="h-4 w-4 text-sidebar-foreground" />
      {!collapsed && (
        <>
          <span className="text-sm text-sidebar-foreground flex-1">
            {colorScheme === 'warm' ? 'Warm' : 'Original'}
          </span>
          <Switch
            checked={colorScheme === 'original'}
            onCheckedChange={toggleColorScheme}
            className="scale-75"
          />
        </>
      )}
    </div>
  );
};
