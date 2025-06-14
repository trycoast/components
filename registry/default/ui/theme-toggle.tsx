import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/registry/default/hooks/use-theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    if (theme === "dark") return setTheme("light");
    if (theme === "light") return setTheme("dark");
    setTheme("light"); // fallback for 'system'
  };

  return (
    <Button onClick={toggle} variant="outline" size="icon" aria-label="Toggle theme">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
