import { Grid, TextField } from '@mui/material';

//Componente que muestra el campo de texto (referencia) para crear/modificar un cliente
const CampoReferencia = ({leyenda, cliente, setCliente, mostrar}) => {
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
                value = {cliente.referencia === '' ? '' : cliente.referencia}
                inputProps = {
                    {
                        disabled : mostrar
                    }
                }
                onChange = {evento => setCliente({...cliente, 'referencia' : evento.target.value.trim()})}
            />
        </Grid>
    )
}

export default CampoReferencia;