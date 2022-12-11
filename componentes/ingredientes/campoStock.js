import { Grid, TextField } from '@mui/material';

//Se ejecuta cada vez que se presiona una tecla en el campo "Stock"
export const stockOnKeyDown = (evento) => {
    var charCode = (evento.which) ? evento.which : evento.keyCode; 
    //charCode = 48: 0 (teclado normal)
    //charCode = 96: 0 (teclado numérico)
    //charCode = 9: tab
    //charCode = 16: shift
    //charCode = 17: ctrl
    //charCode = 20: caps
    //charCode = 107: + (teclado numérico)
    //charCode = 109: - (teclado numérico)
    //charCode = 187: + (teclado normal)
    //charCode = 189: - (teclado normal)
    //No se permite escribir + ni -
    if (charCode === 107 || charCode === 109 || charCode === 187 || charCode === 189)
        evento.preventDefault();
}

//Permite tener la cantidad en stock como un número float o int
//Si textoStock vale ".7", le agrega un 0 ("0.7"), lo transforma a float y lo devuelve
//Si textoStock vale "0.7", lo transforma a float y lo devuelve
//Si textoStock vale "7", lo transforma a int y lo devuelve
export const transformarANumero = (textoStock) => {
    let stockCorregido = textoStock;
    if (textoStock === '')
        return 0;
    if (textoStock.startsWith('.')) {        
        stockCorregido = '0' + textoStock;
    }
    if (stockCorregido.includes('.')) //es un float
        return parseFloat(stockCorregido);
    else //es un int
        return parseInt(stockCorregido);
}

//Componente que muestra el campo de stock para crear/modificar un ingrediente
//El valor mínimo que se puede ingresar es 0
const CampoStock = ({leyenda, ingrediente, setIngrediente, mostrar}) => {

    return (
        <Grid item lg = {3} sm = {3} xs = {12}>
            <TextField
                required
                label = {leyenda}
                fullWidth                
                variant = "outlined"
                type = 'Number'
                value = {ingrediente.stock}
                inputProps = {{
                    disabled : mostrar,
                    min : 0,
                    style : {textAlign : 'center'},
                    onKeyDown : (evento) => {stockOnKeyDown(evento)}
                }}
                //onChange = { evento => setIngrediente({...ingrediente, stock : evento.target.value.trim() !== '' ? obtenerStockComoNumero(evento.target.value.trim()) : 0}) }
                onChange = { evento => { setIngrediente({...ingrediente, stock : transformarANumero(evento.target.value)}) } }
            />
        </Grid>
    )
}

export default CampoStock;

