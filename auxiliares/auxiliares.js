import numeral from 'numeral';
import moment from 'moment';

//Funciones auxiliares

//Formatea una cadena para que tenga un largo máximo de 100 caracteres
//sirve para mostrar el texto del pedido con los puntitos
//ver si se la usa o no
const formatearCadena = (cadena) => {
    // if (cadena.length > 12)
    //     return cadena.substring(0, 8) + "..."
    if (cadena.length < 100)
        return cadena + ' ' + '.'.repeat(100 - cadena.length)
    else
        return cadena;
}    



//Formatea un valor monetario
export const moneda = (numero) => {
    const formato = numero ? numeral(numero).format('$0,0.00') : '';
    return resultado(formato, '.00');
}

const resultado = (formato, clave = '.00') => {
    const isInteger = formato.includes(clave);
    return isInteger ? formato.replace(clave, '') : formato;
}

//Formatea la fecha en el formato DD/MM/YYYY
//Parámetros:
    //fecha: fecha a formatear
//Devuelve:
    //fecha con el formato 'DD/MM/YYYY'
export const formatearFecha = (fecha) => {
    return fecha ? moment(fecha).format('DD/MM/YYYY') : null;
}

//Dado un número decimal, lo decuelve sólo con 2 dígitos decimales (sin redondearlo)
//Parámetros:
    //numero : número decimal a tratar
//Devuelve:
    //número sólo con 2 decimales
export const mostrar2Decimales = (numero) => {
    return numero.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];

}


//Devuelve la proporción como un número float o int
//Si textoProporcion vale ".7", le agrega un 0 ("0.7"), lo transforma a float y lo devuelve
//Si textoProporcion vale "0.7", lo transforma a float y lo devuelve
//Si textoProporcion vale "7", lo transforma a int y lo devuelve
// const obtenerProporcionComoNumero = (textoProporcion) => {
//     let proporcionCorregida = textoProporcion;
//     if (textoProporcion.startsWith('.')) {        
//         proporcionCorregida = '0' + textoProporcion;
//     }
//     if (proporcionCorregida.includes('.')) //es un float
//         return parseFloat(proporcionCorregida);
//     else //es un int
//         return parseInt(proporcionCorregida);
// }
