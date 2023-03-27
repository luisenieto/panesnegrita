import { TextField } from '@mui/material';

//se ejecuta cada vez que se presiona una tecla en el campo "Proporción"
const proporcionOnKeyDown = (evento) => {
    var charCode = (evento.which) ? evento.which : evento.keyCode; 
    //charCode = 9: tab
    //charCode = 16: shift
    //charCode = 17: ctrl
    //charCode = 20: caps
    //charCode = 107: + (teclado numérico)
    //charCode = 109: - (teclado numérico)
    //charCode = 187: + (teclado normal)
    //charCode = 189: - (teclado normal)
    if (charCode === 9 || charCode === 16 || charCode === 17 || charCode === 20 || charCode === 107 || charCode === 109 || charCode === 187 || charCode === 189)
        evento.preventDefault();
}

//Componente que permite especificar la proporción de una equivalencia
const CampoProporcion = ({leyenda, proporcion, setProporcion}) => {
    return (
        <TextField
            required
            // id = {leyenda}
            // name = {leyenda}
            label = {leyenda}
            fullWidth                
            variant = "standard"
            type = 'Number'
            value = {proporcion ? proporcion : ''}
            inputProps = {{
                style : {textAlign : 'center'},
                onKeyDown : evento => { proporcionOnKeyDown(evento) }
            }}
            onChange = { evento => setProporcion(parseFloat(evento.target.value)) }
            //onChange = { evento => setProporcion(evento.target.value.trim() !== '' ? obtenerProporcionComoNumero(evento.target.value.trim()) : null) }
        />
    )
}

export default CampoProporcion;