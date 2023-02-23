//import { conectarBD } from "../unidades/bdAuxiliares";
import { constantes as constantesIngredientes} from "../../../auxiliares/auxiliaresIngredientes";
import { constantes as constantesUnidades } from "../../../auxiliares/auxiliaresUnidades";
import { ObjectId } from 'mongodb';
import { obtenerIngredientes, agregarIngrediente, modificarIngrediente, borrarIngrediente } from "./bdAuxiliares";

//api para el manejo de ingredientes
const handler = async (request, response) => {
    // const resultadoConexion = await conectarBD();

    // //conexión a la BD
    // if (resultadoConexion.mensaje === constantesUnidades.ERROR_CONEXION) {
    //     response.status(500).json({mensaje : constantesUnidades.ERROR_CONEXION});
    //     return;
    // }
    if (request.method === 'GET') {
        const resultadoObtenerIngredintes = await obtenerIngredientes();
        response.status(200).json({...resultadoObtenerIngredintes});
        return;
    }
    else if (request.method === 'POST') {
        const nombre = request.body.nombre;
        const stock = parseInt(request.body.stock);
        const idUnidad = request.body.idUnidad ? new ObjectId(request.body.idUnidad) : null;
        const stockMinimo = parseInt(request.body.stockMinimo);
        const operacion = request.body.operacion;

        //se verifica que el nombre del ingrediente no esté en blanco
        if (nombre === '') {
            response.status(200).json({mensaje : constantesIngredientes.INGREDIENTE_EN_BLANCO});
            return;
        }

        //se verifica que la cantidad en stock sea >= 0
        if (stock < 0) {
            response.status(200).json({mensaje : constantesIngredientes.STOCK_INVALIDO});
            return;
        }

        //se verifica que la cantidad mínima en stock sea >= 0 y que sea <= a la cantidad en stock
        if (stockMinimo < 0 || stockMinimo > stock) {
            response.status(200).json({mensaje : constantesIngredientes.STOCK_MINIMO_INVALIDO});
            return;
        }

        //se verifica que se haya especificado una unidad para el ingrediente
        if (!idUnidad) {
            response.status(200).json({mensaje : constantesIngredientes.UNIDAD_SIN_ESPECIFICAR});
            return;
        }
        
        if (operacion === 'A') { //alta de ingrediente
            const resultadoAgregarIngrediente = await agregarIngrediente({nombre, stock, idUnidad, stockMinimo});
            response.status(200).json({mensaje : resultadoAgregarIngrediente});
        }
        else { //modificación de ingrediente
            const _id = new ObjectId(request.body._id);
            // //request.body._id es un string. Cuando se busca en la BD por _id, el mismo debe ser un ObjectId            
            const resultadoModificarIngrediente = await modificarIngrediente({_id, nombre, stock, stockMinimo, idUnidad});
            response.status(200).json({mensaje : resultadoModificarIngrediente});
        }
        
    }
    else if (request.method === 'DELETE') { 
        const ingrediente = request.body;        
        const resultadoBorrarIngrediente = await borrarIngrediente(ingrediente);
        response.status(200).json({mensaje : resultadoBorrarIngrediente});
    }
}

export default handler;