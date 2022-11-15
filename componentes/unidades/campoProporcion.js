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

//Devuelve la proporción como un número float o int
//Si textoProporcion vale ".7", le agrega un 0 ("0.7"), lo transforma a float y lo devuelve
//Si textoProporcion vale "0.7", lo transforma a float y lo devuelve
//Si textoProporcion vale "7", lo transforma a int y lo devuelve
const obtenerProporcionComoNumero = (textoProporcion) => {
    let proporcionCorregida = textoProporcion;
    if (textoProporcion.startsWith('.')) {        
        proporcionCorregida = '0' + textoProporcion;
    }
    if (proporcionCorregida.includes('.')) //es un float
        return parseFloat(proporcionCorregida);
    else //es un int
        return parseInt(proporcionCorregida);
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
                onKeyDown : (evento) => {proporcionOnKeyDown(evento)}
            }}
            onChange = { evento => setProporcion(evento.target.value.trim() !== '' ? obtenerProporcionComoNumero(evento.target.value.trim()) : null) }
                //setProporcion(evento.target.value.trim() !== '' ? evento.target.value.trim() : null) }}
        />
    )
}

export default CampoProporcion;