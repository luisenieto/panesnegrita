import { constantes as constantesUnidades, esProporcionValida } from '../../../auxiliares/auxiliaresUnidades';
import { obtenerUnidades, transformarStringEnIdLasEquivalencias, agregarUnidad, modificarUnidad, borrarUnidad } from './bdAuxiliares';
import { ObjectId } from 'mongodb';
import { conectarBD } from '../conexion/conexion';
import { constantes as constantesConexion } from '../../../auxiliares/auxiliaresConexion';

//api para el manejo de unidades
const handler = async (request, response) => {
    if (request.method === 'GET') {
        const resultadoObtenerUnidades = await obtenerUnidades();
        response.status(200).json({...resultadoObtenerUnidades});
        return;
    }
    else if (request.method === 'POST') {                  
        const nombre = request.body.nombre;
        //se transforman los _id del vector de equivalencias a ObjectId
        const equivalencias = transformarStringEnIdLasEquivalencias(request.body.equivalencias);
        const operacion = request.body.operacion;
              
        if (operacion === 'A') { //alta de unidad               
            const resultadoAgregarUnidad = await agregarUnidad({nombre, equivalencias});
            response.status(200).json({mensaje : resultadoAgregarUnidad});
            return;  
        }
        else { //modificación de unidad
            const _id = new ObjectId(request.body._id);
            //request.body._id es un string. Cuando se busca en la BD por _id, el mismo debe ser un ObjectId            
            const resultadoModificarUnidad = await modificarUnidad({_id, nombre, equivalencias});
            response.status(200).json({mensaje : resultadoModificarUnidad});
            return;  
        }
    }
    else if (request.method === 'DELETE') {   
        const unidad = request.body;
        const resultadoBorrarUnidad = await borrarUnidad(unidad);
        response.status(200).json({mensaje : resultadoBorrarUnidad});
        return;  
    }
}

export default handler;
