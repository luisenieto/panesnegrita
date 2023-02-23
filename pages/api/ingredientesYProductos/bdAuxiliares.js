import { conectarBD } from "../unidades/bdAuxiliares";
import { constantes as constantesUnidades } from "../../../auxiliares/auxiliaresUnidades";
import { constantes as constantesIngredientesYProductos } from "../../../auxiliares/auxiliaresIngredientesYProductos";

//Obtiene todos los ingredientes y productos ordemados por su nombre
//Devuelve: objeto de la forma:
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || INGREDIENTES_PRODUCTOS_LEIDOS_CORRECTAMENTE || ERROR_LEER_INGREDIENTES || ERROR_LEER_PRODUCTOS)
//    ingredientesYProductos : vector con los ingredientes y productos leidos (si hubo error está vacío)
//}
export const obtenerIngredientesYProductos = async () => {     
    let resultadoObtenerIngredientesYProductos = {
        mensaje : '',
        ingredientesYProductos : []
    }

    //conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();

        let ingredientesYProductosUpdate = [];
        //se leen los ingredientes
        try {
            const ingredientes = await bd.collection('ingredientes').find().toArray();
            for(let i in ingredientes) {
                ingredientesYProductosUpdate.push({
                    idIngrediente : ingredientes[i]._id, //los _id son objetos
                    nombre : ingredientes[i].nombre,
                    tipo : constantesIngredientesYProductos.TIPO_INGREDIENTE_INGREDIENTE         
                })
            }
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return {...resultadoObtenerIngredientesYProductos, mensaje : constantesIngredientesYProductos.ERROR_LEER_INGREDIENTES};
        }

        //se leen los productos
        try {
            const productos = await bd.collection('productos').find().toArray();
            for(let i in productos) {
                ingredientesYProductosUpdate.push({
                    idIngrediente : productos[i]._id, //los _id son objetos
                    nombre : productos[i].nombre,
                    tipo : constantesIngredientesYProductos.TIPO_INGREDIENTE_PRODUCTO       
                })
            }

            resultadoObtenerIngredientesYProductos.ingredientesYProductos = ingredientesYProductosUpdate.sort((a, b) => {
                if (b['nombre'] < a['nombre'])
                    return 1;
                if (b['nombre'] > a['nombre'])
                    return -1
                else
                    return 0;
            });

            resultadoObtenerIngredientesYProductos.mensaje = constantesIngredientesYProductos.INGREDIENTES_PRODUCTOS_LEIDOS_CORRECTAMENTE;            
            resultadoConectarBD.cliente.close();            
            return resultadoObtenerIngredientesYProductos;
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return {
                mensaje : constantesIngredientesYProductos.ERROR_LEER_PRODUCTOS,
                ingredientesYProductos : []
            };
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerIngredientesYProductos, mensaje : constantesUnidades.ERROR_CONEXION};
    }
    
}