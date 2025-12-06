"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type ColorTheme = "blue" | "red" | "green" | "purple";

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    defaultColor?: ColorTheme;
    storageKey?: string;
}

interface ThemeProviderState {
    theme: Theme;
    color: ColorTheme;
    setTheme: (theme: Theme) => void;
    setColor: (color: ColorTheme) => void;
}

const initialState: ThemeProviderState = {
    theme: "dark",
    color: "blue",
    setTheme: () => null,
    setColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = "dark",
    defaultColor = "blue",
    storageKey = "finsight-ui-theme",
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [color, setColor] = useState<ColorTheme>(defaultColor);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem(`${storageKey}-mode`) as Theme;
        const savedColor = localStorage.getItem(`${storageKey}-color`) as ColorTheme;

        if (savedTheme) setTheme(savedTheme);
        if (savedColor) setColor(savedColor);
        setMounted(true);
    }, [storageKey]);

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove("light", "dark");
        root.classList.add(theme);
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute("data-theme", color);
    }, [color]);

    const value = {
        theme,
        color,
        setTheme: (theme: Theme) => {
            localStorage.setItem(`${storageKey}-mode`, theme);
            setTheme(theme);
        },
        setColor: (color: ColorTheme) => {
            localStorage.setItem(`${storageKey}-color`, color);
            setColor(color);
        },
    };

    // Prevent hydration mismatch by rendering children only after mount, 
    // or render them but accept that the theme might flicker. 
    // For a better UX, we usually render immediately but the effect updates the class.
    // However, to avoid "Text content does not match server-rendered HTML" warnings if we were conditionally rendering,
    // we just return children. The class application happens in useEffect which is client-side only.

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
