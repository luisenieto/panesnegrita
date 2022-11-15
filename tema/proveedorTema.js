import { useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import ComponentsOverrides from './componentsOverrides';

const ProveedorTema = ({children}) => {
    const opcionesTema = useMemo(() => ({
        shape: { borderRadius: 8 },
    }), []);

    const tema = createTheme(opcionesTema);
    tema.components = ComponentsOverrides(tema);

    return (
        <StyledEngineProvider injectFirst>
            <MUIThemeProvider theme = {tema}>
                {children}
            </MUIThemeProvider>
        </StyledEngineProvider>
    )
}

export default ProveedorTema;