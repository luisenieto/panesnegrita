import { Stack, Box, Typography } from '@mui/material';

//Componente que muestra el estado y cantidad de un pedido
const Estado = ({ color, cantidad }) => {
    return (
        <Stack direction = "row">
            <Box sx = {{
                    ml: -0.75,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',                    
                    bgcolor: color,
                }}
            />
            <Typography variant = "subtitle2" sx = {{ fontWeight: 'bold'}}>
                &nbsp; &nbsp;
                {cantidad}
            </Typography>
        </Stack>
    )
}

export default Estado;