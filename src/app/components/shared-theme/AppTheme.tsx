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
  mode: 'light'; 
}

export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents, mode } = props;

  const prefersDarkMode = React.useMemo(() => window.matchMedia('(prefers-color-scheme: dark)').matches, []);

  const theme = React.useMemo(() => {
    const currentMode = 'light';
    return disableCustomTheme
      ? {}
      : createTheme({
          palette: {
            mode: currentMode, 
            background: {
              default: currentMode === 'light' ? '#ffffff' : '#121212', // Explicitly set light background
              paper: currentMode === 'light' ? '#ffffff' : '#333333', // Paper background
            },
          },
          colorSchemes: {
            light: colorSchemes.light // Only include light scheme
          },          
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
