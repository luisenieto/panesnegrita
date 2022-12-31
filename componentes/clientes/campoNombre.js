import { Grid, TextField } from '@mui/material';

//Componente que muestra el campo de texto (nombre) para crear/modificar un cliente
const CampoNombre = ({leyenda, cliente, setCliente, mostrar}) => {
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
                value = {cliente.nombre === '' ? '' : cliente.nombre}
                inputProps = {
                    {
                        disabled : mostrar
                    }
                }
                onChange = {evento => setCliente({...cliente, 'nombre' : evento.target.value.trim()})}
            />
        </Grid>
    )
}

export default CampoNombre;