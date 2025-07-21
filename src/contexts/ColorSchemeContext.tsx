
import React, { createContext, useContext, useEffect, useState } from 'react';

type ColorScheme = 'warm' | 'original';

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

export const useColorScheme = () => {
  const context = useContext(ColorSchemeContext);
  if (context === undefined) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context;
};

interface ColorSchemeProviderProps {
  children: React.ReactNode;
}

export const ColorSchemeProvider: React.FC<ColorSchemeProviderProps> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('colorScheme');
    return (saved as ColorScheme) || 'warm';
  });

  useEffect(() => {
    localStorage.setItem('colorScheme', colorScheme);
    
    // Apply color scheme to root element
    const root = document.documentElement;
    root.setAttribute('data-color-scheme', colorScheme);
    
    // Apply theme class for proper styling
    if (colorScheme === 'original') {
      root.classList.add('original-theme');
    } else {
      root.classList.remove('original-theme');
    }
  }, [colorScheme]);

  const toggleColorScheme = () => {
    setColorScheme(prev => prev === 'warm' ? 'original' : 'warm');
  };

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
};
