import { Typography } from '@mui/material';

//componente que define la acción que se está realizando: creación o modificación de una unidad
const EtiquetaEstado = ({leyenda}) => {
    return (
        <Typography variant = "h6" gutterBottom>
            {leyenda}
        </Typography>
    )
}

export default EtiquetaEstado;