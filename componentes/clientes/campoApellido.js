import { Grid, TextField } from '@mui/material';

//Componente que muestra el campo de texto (apellido) para crear/modificar un cliente
const CampoApellido = ({leyenda, cliente, setCliente, mostrar}) => {
    return (
        <Grid item lg = {6} sm = {12} xs = {12}>
            <TextField
                id = {leyenda}
                name = {leyenda}
                label = {leyenda}
                fullWidth    
                autoFocus = {true}            
                variant = "outlined"
                value = {cliente.apellido === '' ? '' : cliente.apellido}
                inputProps = {
                    {
                        disabled : mostrar
                    }
                }
                onChange = {evento => setCliente({...cliente, 'apellido' : evento.target.value.trim()})}
            />
        </Grid>
    )
}

export default CampoApellido;