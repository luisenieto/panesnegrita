import { Grid, TextField } from '@mui/material';
import { ProveedorContexto } from '../../contexto/proveedor';
import { useContext } from 'react';
import { obtenerPrecio } from '../../auxiliares/auxiliaresProductos';

//Componente que muestra el importe de un determinado pedido
//El valor mínimo que se puede especificar es 0
const CampoImporte = ({ leyenda, pedido, setPedido }) => {
    const { productos } = useContext(ProveedorContexto);

    //Se ejecuta cada vez que se presiona una tecla en el campo "Importe"
    const importeOnKeyDown = (evento) => {
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

    return (
        <Grid item lg = {3} sm = {3} xs = {6}>
            <TextField
                required
                label = {leyenda}
                fullWidth                
                variant = "outlined"
                type = 'Number'
                //value = {pedido.importe}
                value = {pedido.idProducto ? obtenerPrecio(pedido.idProducto, productos) * pedido.cantidad : pedido.importe}
                inputProps = {{
                    //disabled : mostrar,
                    min : 1,
                    style : {textAlign : 'center'},
                    onKeyDown : (evento) => {importeOnKeyDown(evento)}
                }}
                onChange = { evento => { 
                    console.log(parseFloat(evento.target.value));
                    console.log(pedido.cantidad);
                    console.log(parseFloat(evento.target.value) * pedido.cantidad);
                    setPedido({...pedido, importe : parseFloat(evento.target.value) * pedido.cantidad });
                } }
            />
        </Grid>
    )
}

export default CampoImporte;