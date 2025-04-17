import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
  theme: "system",
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}) {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey);
    setTheme(storedTheme || defaultTheme);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, theme);
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    } else if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, storageKey]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
