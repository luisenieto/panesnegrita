import { Grid, TextField } from '@mui/material';

//Componente que muestra el campo de texto (nombre) para crear/modificar un producto
const CampoNombre = ({leyenda, producto, setProducto, mostrar}) => {
    return (
        <Grid item lg = {6} sm = {12} xs = {12}>
            <TextField
                required
                id = {leyenda}
                name = {leyenda}
                label = {leyenda}
                fullWidth    
                autoFocus = {true}            
                variant = "outlined"
                value = {producto.nombre === '' ? '' : producto.nombre}
                inputProps = {
                    {
                        disabled : mostrar
                    }
                }
                onChange = {evento => setProducto({...producto, 'nombre' : evento.target.value})}
            />
        </Grid>
    )
}

export default CampoNombre;