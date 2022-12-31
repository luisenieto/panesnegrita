import { Grid, TextField } from '@mui/material';

//Componente que muestra el campo de texto (correo) para crear/modificar un cliente
const CampoCorreo = ({leyenda, cliente, setCliente, mostrar}) => {
    return (
        <Grid item lg = {6} sm = {12} xs = {12}>
            <TextField
                id = {leyenda}
                name = {leyenda}
                label = {leyenda}
                fullWidth    
                autoFocus = {true}            
                variant = "outlined"
                value = {cliente.correo === '' ? '' : cliente.correo}
                inputProps = {
                    {
                        disabled : mostrar
                    }
                }
                onChange = {evento => setCliente({...cliente, 'correo' : evento.target.value.trim()})}
            />
        </Grid>
    )
}

export default CampoCorreo;