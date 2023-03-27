import { MongoClient } from 'mongodb';
import { constantes } from '../../../auxiliares/auxiliaresConexion';

//Realiza la conexión a la BD
//Devuelve: 
    //{
    //  mensaje: resultado de la operación (CONEXION_EXITOSA || ERROR_CONEXION)
    //  cliente: objeto cliente con la conexión a la BD si se pudo establecer, o null en caso de error
    //}
export const conectarBD = async () => {
    let resultado = {
        mensaje : '',
        cliente : null
    };
    
    try {
        resultado.cliente = await MongoClient.connect('mongodb+srv://lula:zdFuV5NTaPoncAMl@cluster0.ty0xvlr.mongodb.net/panesnegrita');                
        resultado.mensaje = constantes.CONEXION_EXITOSA
    }
    catch(error) {
        resultado.mensaje = constantes.ERROR_CONEXION
    }        

	return resultado;
}
