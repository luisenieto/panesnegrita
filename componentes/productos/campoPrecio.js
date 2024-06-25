import { Grid, TextField } from '@mui/material';

//Componente que muestra el campo precio cuando se crea/modifica un producto
const CampoPrecio = ({ leyenda, producto, setProducto, mostrar }) => {

    //se ejecuta cada vez que se presiona una tecla en el campo "Precio"
    const precioOnKeyDown = (evento) => {
        var charCode = (evento.which) ? evento.which : evento.keyCode; 
        //charCode = 9: tab
        //charCode = 16: shift
        //charCode = 17: ctrl
        //charCode = 20: caps
        //charCode = 107: + (teclado numérico)
        //charCode = 109: - (teclado numérico)
        //charCode = 187: + (teclado normal)
        //charCode = 189: - (teclado normal)
        if (charCode === 16 || charCode === 107 || charCode === 109 || charCode === 187 || charCode === 189)
            evento.preventDefault();
    }

    return (
        <Grid item lg = {3} sm = {3} xs = {3}>
            <TextField
                required
                // id = {leyenda}
                // name = {leyenda}
                label = {leyenda}
                fullWidth                
                variant = "standard"
                type = 'Number'
                value = {producto.precio}
                inputProps = {{
                    min : 1,
                    style : {textAlign : 'center'},
                    disabled : mostrar,
                    onKeyDown : (evento) => {precioOnKeyDown(evento)}
                }}
                onChange = { evento => setProducto( { ...producto, precio: evento.target.value.trim() !== '' ? parseFloat(evento.target.value) : 1 } ) }
                //onChange = { evento => setProducto({...producto, 'precio': evento.target.value.trim() !== '' ? obtenerPrecioComoNumero(evento.target.value.trim()) : 0}) }
            />
        </Grid>
    )
}

export default CampoPrecio;