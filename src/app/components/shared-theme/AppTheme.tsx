import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import { inputsCustomizations } from './customizations/inputs';
import { dataDisplayCustomizations } from './customizations/dataDisplay';
import { feedbackCustomizations } from './customizations/feedback';
import { navigationCustomizations } from './customizations/navigation';
import { surfacesCustomizations } from './customizations/surfaces';
import { colorSchemes, typography, shadows, shape } from './themePrimitives';

interface AppThemeProps {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions['components'];
  mode?: 'light' | 'dark'; // Optional prop to override system preference
}

export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents, mode } = props;

  const prefersDarkMode = React.useMemo(() => window.matchMedia('(prefers-color-scheme: dark)').matches, []);

  const theme = React.useMemo(() => {
    const currentMode = mode || (disableCustomTheme ? 'light' : prefersDarkMode ? 'dark' : 'light');
    return disableCustomTheme
      ? {}
      : createTheme({
          palette: {
            mode: currentMode, // Use the resolved mode (light or dark)
            background: {
              default: currentMode === 'light' ? '#ffffff' : '#121212', // Explicitly set light background
              paper: currentMode === 'light' ? '#ffffff' : '#333333', // Paper background
            },
          },
          colorSchemes,
          typography,
          shadows,
          shape,
          components: {
            ...inputsCustomizations,
            ...dataDisplayCustomizations,
            ...feedbackCustomizations,
            ...navigationCustomizations,
            ...surfacesCustomizations,
            ...themeComponents,
          },
        });
  }, [disableCustomTheme, themeComponents, prefersDarkMode, mode]);

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}
