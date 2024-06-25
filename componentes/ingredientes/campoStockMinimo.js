import { Grid, TextField } from '@mui/material';
import { stockOnKeyDown } from './campoStock';

//Componente que muestra el campo de stock mínimo para crear/modificar un ingrediente
//El valor mínimo que se puede ingresar es 0
//El valor máximo que se puede ingresar es la cantidad en stock
const CampoStockMinimo = ({leyenda, ingrediente, setIngrediente, mostrar}) => {
    return (
        <Grid item lg = {3} sm = {3} xs = {12}>
            <TextField
                required
                label = {leyenda}
                fullWidth                
                variant = "outlined"
                type = 'Number'
                value = {ingrediente.stockMinimo}
                inputProps = {{
                    disabled : mostrar,
                    min : 0,
                    max : ingrediente.stock,
                    style : {textAlign : 'center'},
                    onKeyDown : (evento) => {stockOnKeyDown(evento)}
                }}
                onChange = { evento => setIngrediente({...ingrediente, stockMinimo : evento.target.value.trim() !== '' ? parseFloat(evento.target.value) : 0}) }
            />
        </Grid>
    )
}

export default CampoStockMinimo;