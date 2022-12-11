import { Grid, TextField } from '@mui/material';

//Componente que muestra el campo de texto (nombre) para crear/modificar un ingrediente
const CampoNombre = ({leyenda, ingrediente, setIngrediente, mostrar}) => {
    return (
        <Grid item lg = {12} sm = {12} xs = {12}>
            <TextField
                required
                id = {leyenda}
                name = {leyenda}
                label = {leyenda}
                fullWidth    
                autoFocus = {true}            
                variant = "outlined"
                value = {ingrediente.nombre === '' ? '' : ingrediente.nombre}
                inputProps = {
                    {
                        disabled : mostrar
                    }
                }
                onChange = {evento => setIngrediente({...ingrediente, 'nombre' : evento.target.value.trim()})}
            />
        </Grid>
    )
}

export default CampoNombre;