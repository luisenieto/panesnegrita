import { Grid, TextField } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';

//Componente que muestra el campo de texto (referencia) para crear/modificar un cliente
const CampoTelefono = ({leyenda, cliente, setCliente, mostrar}) => {
    return (
        <Grid item lg = {6} sm = {12} xs = {12}>
            <MuiTelInput 
                fullWidth
                id = {leyenda}
                label = {leyenda}
                name = {leyenda}
                // inputProps = {
                //     {
                //         disabled : mostrar
                //     }
                // }
                onChange = {valor => setCliente({...cliente, 'telefono' : valor})}
                value = {cliente.telefono === '' ? '' : cliente.telefono}
            />
        </Grid>
    )
}

export default CampoTelefono;