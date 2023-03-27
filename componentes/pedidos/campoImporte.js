import { Grid, TextField } from '@mui/material';

//Componente que muestra el importe de un determinado pedido
//El valor mínimo que se puede especificar es 0
const CampoImporte = ({ leyenda, pedido, setPedido }) => {

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
                value = {pedido.importe}
                inputProps = {{
                    //disabled : mostrar,
                    min : 0,
                    style : {textAlign : 'center'},
                    onKeyDown : (evento) => {importeOnKeyDown(evento)}
                }}
                onChange = { evento => { setPedido({...pedido, importe : parseFloat(evento.target.value)}) } }
            />
        </Grid>
    )
}

export default CampoImporte;