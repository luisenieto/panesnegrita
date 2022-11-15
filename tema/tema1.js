import { createTheme } from '@mui/material/styles';
import ComponentsOverrides from './componentsOverrides';
import palette from './palette';

const opcionesTema = {
    
    palette,
    shape: { 
        borderRadius: 8 
    },
};

const tema = createTheme(opcionesTema);
tema.components = ComponentsOverrides(tema);
//console.log(tema);
export default tema;

