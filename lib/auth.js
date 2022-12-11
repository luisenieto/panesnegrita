//Utilidades para el manejo de la seguridad y autenticación
import { hash, compare } from "bcryptjs"
import { getSession } from 'next-auth/react';

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

//Controla si se está logueado o no
//Si no se está logueado, se redirige para que se loguee
//Si se está logueado, se devuelve el objeto sesion (para usarse en caso de ser necesario)
const controlarSiSeEstaLogueado = async (request) => {
    const sesion = await getSession({req : request});

    //si no se está logueado, se redirige para que se loguee
    if (!sesion) { 
        return {
            redirect : {
                destination : '/autenticacion',
                permanent : false
            }
        }
    }

    //si se está logueado, se devuelve el objeto sesion (para usarse en caso de ser necesario)
    //también se podría devolver {}
    //Lo que no se puede devolver es null
    return {
        props : sesion
    }
}



export { encriptarClave, verificarClave, controlarSiSeEstaLogueado };