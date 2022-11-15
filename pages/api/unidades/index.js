import { constantes, esProporcionValida } from '../../../auxiliares/auxiliaresUnidades';
import { conectarBD, obtenerUnidades, existeUnidad, obtenerUnidadesAModificar, agregarUnidad, modificarUnidad, obtenerUnidadesQueLaTienenComoEquivalencia, borrarUnidad } from './bdauxiliares';
import { ObjectId } from 'mongodb';

//api para el manejo de unidades (creación)
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
        //    mensaje : resultado de la operación (UNIDADES_LEIDAS_CORRECTAMENTE || ERROR_LEER_UNIDADES)
        //    unidades : vector con las unidades leidas (si hubo error vale null)
        //}
        const resultadoObtenerUnidades = await obtenerUnidades(resultadoConexion.cliente);
        resultadoConexion.cliente.close();
        response.status(200).json({...resultadoObtenerUnidades});
        return;
    }
    else if (request.method === 'POST') {        
        const idUnidad = request.body.idUnidad;
        const nombre = request.body.nombre;
        const equivalencias = request.body.equivalencias;
        const operacion = request.body.operacion;
        let resultadoExisteUnidad;
        let resultadoUnidadesAModificar;

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
            const resultadoAgregarUnidad = await agregarUnidad({idUnidad, nombre, equivalencias});
            response.status(200).json({mensaje : resultadoAgregarUnidad});
        }
        else { //modificación de unidad
            const _id = new ObjectId(request.body._id);
            //request.body._id es un string. Cuando se busca en la BD por _id, el mismo debe ser un ObjectId

            //se verifica que no exista otra unidad con ese nombre
            //la verificación es insensible a mayúsculas/minúsculas            
            // try {
            //     resultadoExisteUnidad = await existeUnidad(cliente, nombre, idUnidad);                
            //     if (resultadoExisteUnidad.existeUnidad) { //ya existe la unidad
            //         response.status(200).json({mensaje : constantes.UNIDAD_REPETIDA});
            //         return;
            //     }
            // }
            // catch(error) {
            //     cliente.close();
            //     response.status(500).json({mensaje : resultadoExisteUnidad.mensaje});
            //     return;
            // }

            //se obtienen las unidades a modificar para actualizarles las equivalencias
            // try {
            //     resultadoUnidadesAModificar = await obtenerUnidadesAModificar(cliente, idUnidad, equivalencias);
            // }
            // catch(error) {
            //     cliente.close();
            //     response.status(500).json({mensaje : resultadoUnidadesAModificar.mensaje});
            //     return;
            // }

            const resultadoModificarUnidad = await modificarUnidad({_id, idUnidad, nombre, equivalencias});
            response.status(200).json({mensaje : resultadoModificarUnidad});

            // cliente.close();
            // response.status(200).json({mensaje : resultadoModificarUnidad});
        }
    }
    else if (request.method === 'DELETE') {   
        const unidad = request.body;
        const resultado = await obtenerUnidadesQueLaTienenComoEquivalencia(cliente, unidad.idUnidad);
        
        if (resultado.mensaje === constantes.UNIDADES_LEIDAS_CORRECTAMENTE) {
            //se borra esta unidad del resto de unidades que la tienen como equivalente
            for(let i in resultado.unidadesQueLaTienenComoEquivalencia) {
                const unidadUpdate = resultado.unidadesQueLaTienenComoEquivalencia[i];
                const equivalenciasUpdate = unidadUpdate.equivalencias.filter(u => u.idUnidad !== unidad.idUnidad);
                unidadUpdate.equivalencias = equivalenciasUpdate;
            }

            const resultadoBorrarUnidad = await borrarUnidad(cliente, {...unidad}, resultado.unidadesQueLaTienenComoEquivalencia);

            cliente.close();
            response.status(200).json({mensaje : resultadoBorrarUnidad});
        }
        else
            response.status(200).json({mensaje : resultado.mensaje});
    }
}

export default handler;
