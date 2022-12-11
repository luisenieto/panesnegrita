import { Typography } from '@mui/material';

//componente que define la etiqueta con el título del formulario para crear/modificar una unidad
const EtiquetaTitulo = ({leyenda}) => {
    return (
        <Typography component = "h1" variant = "h4" align = "center">
            {leyenda}
        </Typography>
    )
}

export default EtiquetaTitulo;