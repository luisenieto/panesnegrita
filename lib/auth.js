//Utilidades para el manejo de la seguridad
import { hash, compare } from "bcryptjs"

//dada una clave, la encripta
const encriptarClave = async (clave) => {
    const claveEncriptada = await hash(clave, 12);
    return claveEncriptada;
}

//compara si clave (sin encriptar) es igual a claveEncriptada (encriptada)
const verificarClave = async (clave, claveEncriptada) => {
    const sonIguales = await compare(clave, claveEncriptada);
    return sonIguales;
}



export { encriptarClave, verificarClave };