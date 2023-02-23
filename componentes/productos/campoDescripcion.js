import { Grid, TextField } from '@mui/material';

//Componente que muestra el campo de texto (descripción) para crear/modificar un producto
const CampoDescripcion = ({leyenda, producto, setProducto, mostrar}) => {
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
                value = {producto.descripcion === '' ? '' : producto.descripcion}
                inputProps = {
                    {
                        disabled : mostrar
                    }
                }
                onChange = {evento => setProducto({...producto, 'descripcion' : evento.target.value.trim()})}
            />
        </Grid>
    )
}

export default CampoDescripcion;