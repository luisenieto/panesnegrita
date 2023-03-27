import { conectarBD } from "../conexion/conexion";
import { constantes as constantesConexion} from "../../../auxiliares/auxiliaresConexion";
//import { constantes as constantesUnidades } from "../../../auxiliares/auxiliaresUnidades";
import { constantes as constantesIngredientesYProductos } from "../../../auxiliares/auxiliaresIngredientesYProductos";

//Obtiene todos los ingredientes y productos ordemados por su nombre
//Para obtener los ingredientes y productos:
    //1. Se conecta a la BD
    //2. Obtiene los ingredientes
    //3. Obtiene los productos
    //4. Ordena los ingredientes y productos según el nombre de los mismos
//Devuelve:
    //{
    //    mensaje : constantesConexion.ERROR_CONEXION || constantesIngredientesYProductos.INGREDIENTES_PRODUCTOS_LEIDOS_CORRECTAMENTE || constantesIngredientesYProductos.ERROR_LEER_INGREDIENTES || constantesIngredientesYProductos.ERROR_LEER_PRODUCTOS
    //    ingredientesYProductos : vector con los ingredientes y productos leidos (si hubo error está vacío)
    //}
export const obtenerIngredientesYProductos = async () => {     
    let resultadoObtenerIngredientesYProductos = {
        mensaje : '',
        ingredientesYProductos : []
    }

    //1. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //2. Obtiene los ingredientes
    const bd = resultadoConectarBD.cliente.db();

    let ingredientesYProductosUpdate = [];
    try {
        const ingredientes = await bd.collection('ingredientes').find().toArray();
        for(let i in ingredientes) {
            ingredientesYProductosUpdate.push({
                idIngrediente : ingredientes[i]._id, //los _id son objetos
                nombre : ingredientes[i].nombre,
            })
        }
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return {...resultadoObtenerIngredientesYProductos, mensaje : constantesIngredientesYProductos.ERROR_LEER_INGREDIENTES};
    }

    //3. Obtiene los productos
    try {
        const productos = await bd.collection('productos').find().toArray();
        for(let i in productos) {
            ingredientesYProductosUpdate.push({
                idIngrediente : productos[i]._id, //los _id son objetos
                nombre : productos[i].nombre,
            })
        }
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return {
            mensaje : constantesIngredientesYProductos.ERROR_LEER_PRODUCTOS,
            ingredientesYProductos : []
        };
    } 

    //4. Ordena los ingredientes y productos según el nombre de los mismos
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