import { Stack, Box, Typography } from '@mui/material';
import { useTheme } from '@emotion/react';

const PedidosEnColores = ({estado, cantidad}) => {
    const tema = useTheme();
    let color;
    switch(estado) {
        case 'pedido' :
            color = tema.palette.error.main; //rojo
            break;
        case 'en elaboración':
            color = tema.palette.warning.main; //amarillo
            break;
        default: //terminado
            color = tema.palette.success.main; //verde
            break;
    }

    return (
        <Stack component = "span" direction = "row" alignItems = "center" justifyContent = "flex-end">
            <Box sx = {{
                ml: -0.75,
                width: 16,
                height: 16,
                borderRadius: '50%',
                // border: (theme) => `solid 2px ${theme.palette.background.paper}`,
                // boxShadow: (theme) => `inset -1px 1px 2px ${alpha(theme.palette.common.black, 0.24)}`,
                bgcolor: color,
            }}
            />
            <Typography variant = "subtitle2" sx = {{ fontWeight: 'bold' }}>
                &nbsp;
                {cantidad}
            </Typography>
        </Stack>
    )
}

export default PedidosEnColores;