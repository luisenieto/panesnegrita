import { Button, Menu, MenuItem, IconButton, Drawer, Stack, Typography, Divider, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { constantes } from '../../auxiliares/auxiliaresClientes';
import { useState } from 'react';
import { useTheme } from '@emotion/react';

const Ordenamiento = ({ opciones_ordenamiento, ordenamientoElegido, setOrdenamientoElegido }) => {
    const tema = useTheme();

    const [abierto, setAbierto] = useState(false);
    //controla la visibilidad del menú

    const handleOpen = (evento) => {  
        if (!abierto)      
            setAbierto(evento.currentTarget)
        else
            setAbierto(null);
    };

    const handleClose = () => {
        //console.log('handleClose');
        setAbierto(null);
    };

    const handleClic = (opcion) => {
        setOrdenamientoElegido(opcion);
        setAbierto(null);
    }

    return (
        <Button
            color = "inherit"
            disableRipple
            sx = {{bgcolor : tema.palette.warning.contrastText}}
            onClick = {handleOpen}
        >
            {constantes.ORDENAR_POR}&nbsp;
            {<Typography component = "span" variant = "subtitle2" sx = {{ color: 'text.main' }}>
                {ordenamientoElegido}
            </Typography>}
            <Menu
                keepMounted
                anchorEl = {abierto}
                open = {Boolean(abierto)}
                onClose = {handleClose}
                anchorOrigin = {{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin = {{ vertical: 'top', horizontal: 'right' }}
            >
                {
                    opciones_ordenamiento.map((opcion, i) => (
                        <MenuItem
                            key = {i}
                            //selected = {opcion === constantes.ORDENAR_POR_APELLIDO_ASC}
                            //onClick = {handleClose}
                            onClick = {() => handleClic(opcion)}
                            sx = {{ typography: 'body2' }}
                        >
                            {opcion}
                        </MenuItem>
                    ))
                }
            </Menu>        
        </Button>
    )
}

export default Ordenamiento;