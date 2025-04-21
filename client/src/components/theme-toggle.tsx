import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  iconOnly?: boolean;
}

export function ThemeToggle({ className, iconOnly = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button 
      variant="ghost" 
      size={iconOnly ? "icon" : "sm"}
      onClick={toggleTheme}
      className={cn(
        "relative transition-colors hover:text-white", 
        iconOnly && "p-2 text-gray-300 hover:bg-gray-800 rounded-full",
        className
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        <Sun className={cn("h-[1.2rem] w-[1.2rem] transition-all", iconOnly ? "h-5 w-5" : "mr-2")} />
      ) : (
        <Moon className={cn("h-[1.2rem] w-[1.2rem] transition-all", iconOnly ? "h-5 w-5" : "mr-2")} />
      )}
      {!iconOnly && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
    </Button>
  );
}