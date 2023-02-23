import { Grid, TextField } from '@mui/material';

//Componente que muestra la cantidad de un determinado pedido
//El valor mínimo que se puede ingresar es 0
const CampoCantidad = ({ leyenda, producto, pedido, setPedido }) => {

    //Se ejecuta cada vez que se presiona una tecla en el campo "Cantidad"
    const cantidadOnKeyDown = (evento) => {
        var charCode = (evento.which) ? evento.which : evento.keyCode; 
        //charCode = 9: tab        
        //charCode = 107: + (teclado numérico)
        //charCode = 109: - (teclado numérico)
        //charCode = 187: + (teclado normal)
        //charCode = 189: - (teclado normal)
        //No se permite escribir + ni -
        if (charCode === 107 || charCode === 109 || charCode === 187 || charCode === 189)
            evento.preventDefault();
    }   

    const handleChange = (evento) => {
        let cantidad = parseInt(evento.target.value);
        setPedido({...pedido, cantidad, importe : cantidad * producto.precio});
    }

    return (
        <Grid item lg = {3} sm = {3} xs = {6}>
            <TextField
                required
                label = {leyenda}
                fullWidth                
                variant = "outlined"
                type = 'Number'
                value = {pedido.cantidad}
                inputProps = {{
                    //disabled : mostrar,
                    min : 1,
                    style : {textAlign : 'center'},
                    onKeyDown : (evento) => {cantidadOnKeyDown(evento)}
                }}
                onChange = { handleChange }
            />
        </Grid>
    )
}

export default CampoCantidad;