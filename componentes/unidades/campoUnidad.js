import { Grid, TextField } from '@mui/material';

//Componente que muestra el campo de texto para crear/modificar una unidad de medición
const CampoUnidad = ({leyenda, unidad, setUnidad, mostrar}) => {
    return (
        <Grid item xs = {12}>
            <TextField
                required
                id = {leyenda}
                name = {leyenda}
                label = {leyenda}
                fullWidth                
                variant = "standard"
                value = {unidad.nombre === '' ? '' : unidad.nombre}
                inputProps = {
                    {
                        disabled : mostrar
                    }
                }
                onChange = {evento => setUnidad({...unidad, 'nombre' : evento.target.value.trim()})}
            />
        </Grid>
    )
}

export default CampoUnidad;