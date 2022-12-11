import { Typography } from '@mui/material';

//componente que define la acción que se está realizando: creación o modificación de una unidad
const EtiquetaEstado = ({leyenda}) => {
    return (
        <Typography variant = "subtitle1" gutterBottom>
            {leyenda}
        </Typography>
    )
}

export default EtiquetaEstado;