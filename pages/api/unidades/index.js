import { constantes, esProporcionValida } from '../../../auxiliares/auxiliaresUnidades';
import { conectarBD, obtenerUnidades, transformarStringEnIdLasEquivalencias, agregarUnidad, modificarUnidad, borrarUnidad } from './bdAuxiliares';
import { ObjectId } from 'mongodb';

//api para el manejo de unidades
const handler = async (request, response) => {
    const resultadoConexion = await conectarBD();

    //conexión a la BD
    if (resultadoConexion.mensaje === constantes.ERROR_CONEXION) {
        response.status(500).json({mensaje : constantes.ERROR_CONEXION});
        return;
    }
        

    if (request.method === 'GET') {
        //devuelve
        //{
        //    mensaje : resultado de la operación (UNIDADES_LEIDAS_CORRECTAMENTE || ERROR_LEER_UNIDADES || ERROR_CONEXION)
        //    unidades : vector con las unidades leidas (si hubo error vale [])
        //}
        const resultadoObtenerUnidades = await obtenerUnidades(resultadoConexion.cliente);
        resultadoConexion.cliente.close();
        response.status(200).json({...resultadoObtenerUnidades});
        return;
    }
    else if (request.method === 'POST') {                  
        const nombre = request.body.nombre;

        //se transforman los _id del vector de equivalencias a ObjectId
        const equivalencias = transformarStringEnIdLasEquivalencias(request.body.equivalencias);
        const operacion = request.body.operacion;
        
        //se verifica que el nombre de la unidad no esté en blanco
        if (nombre === '') {
            response.status(200).json({mensaje : constantes.UNIDAD_EN_BLANCO});
            return;
        }

        //Por cada equivalencia se verifica que la proporción sea válida
        for(let i in equivalencias) {
            if (!esProporcionValida(equivalencias[i].proporcion)) {
                response.status(200).json({mensaje : constantes.PROPORCION_INVALIDA});
                return;  
            }
        }        
        if (operacion === 'A') { //alta de unidad               
            const resultadoAgregarUnidad = await agregarUnidad({nombre, equivalencias});
            response.status(200).json({mensaje : resultadoAgregarUnidad});
        }
        else { //modificación de unidad
            const _id = new ObjectId(request.body._id);
            //request.body._id es un string. Cuando se busca en la BD por _id, el mismo debe ser un ObjectId            
            const resultadoModificarUnidad = await modificarUnidad({_id, nombre, equivalencias});
            response.status(200).json({mensaje : resultadoModificarUnidad});
        }
    }
    else if (request.method === 'DELETE') {   
        const unidad = request.body;
        const resultadoBorrarUnidad = await borrarUnidad(unidad);
        response.status(200).json({mensaje : resultadoBorrarUnidad});
    }
}

export default handler;
