import { FiFilter } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';
import { Button, IconButton, Drawer, Stack, Typography, Divider, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { constantes } from '../../auxiliares/auxiliaresClientes';
import { useTheme } from '@emotion/react';

const Filtro = ({ mostrarFiltro, setMostrarFiltro, opciones_filtrado, filtroElegido, setFiltroElegido, setOPCIONES_ORDENAMIENTO}) => {    
    const tema = useTheme();

    const handleChange = (evento) => {
        if (evento.target.value === constantes.FILTRO_TODOS || evento.target.value === constantes.FILTRO_CON_PEDIDOS)
            setOPCIONES_ORDENAMIENTO([constantes.ORDENAR_POR_APELLIDO_ASC, constantes.ORDENAR_POR_APELLIDO_DESC, constantes.ORDENAR_POR_PEDIDOS_ASC, constantes.ORDENAR_POR_PEDIDOS_DESC])
        else
            setOPCIONES_ORDENAMIENTO([constantes.ORDENAR_POR_APELLIDO_ASC, constantes.ORDENAR_POR_APELLIDO_DESC]);
        setFiltroElegido(evento.target.value);
        //console.log(evento.target.value);
    };

    return (
        <>
            <Button 
                disableRipple 
                color = "inherit" 
                sx = {{bgcolor : tema.palette.warning.contrastText}}
                onClick = {() => setMostrarFiltro(!mostrarFiltro)}
            >
                {constantes.FILTROS}&nbsp;
                <FiFilter />
            </Button>
            {/* <IconButton onClick = {() => setMostrarFiltro(!mostrarFiltro)} >
                Filtros&nbsp;
                <FiFilter />                
            </IconButton> */}
            <Drawer
                anchor = 'right'
                open = {mostrarFiltro}
                onClose = {() => setMostrarFiltro(false)}
                PaperProps = {{
                    sx: { width: 280, border: 'none', overflow: 'hidden' },
                }}
            >
                <Stack direction = "row" alignItems = "center" justifyContent = "space-between" sx = {{ px: 1, py: 2 }}>
                    <Typography variant = "subtitle1" sx={{ ml: 1 }}>
                        {constantes.FILTROS}
                    </Typography>
                    <IconButton onClick = {() => setMostrarFiltro(false)} >
                        <MdClose />                
                    </IconButton>
                </Stack>
                <Divider />
                <Stack spacing = {3} sx = {{ p: 3 }}>
                    <RadioGroup 
                        defaultValue = {filtroElegido} 
                        onChange = {handleChange} 
                    >
                        {
                            opciones_filtrado.map((opcion, i) => (
                                <FormControlLabel 
                                    key = {i} 
                                    value = {opcion} 
                                    control = { <Radio color = 'texto' /> } 
                                    label = {opcion} />
                            ))
                        }
                    </RadioGroup>
                </Stack>
            </Drawer>
        </>
    )
}

export default Filtro;