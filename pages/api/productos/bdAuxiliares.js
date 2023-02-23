import { conectarBD } from "../unidades/bdAuxiliares";
import { constantes as constantesUnidades } from "../../../auxiliares/auxiliaresUnidades";
import { constantes as constantesProductos } from "../../../auxiliares/auxiliaresProductos";
import { ObjectId } from 'mongodb';

//Obtiene todos los productos
//Devuelve: objeto de la forma:
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || PRODUCTOS_LEIDOS_CORRECTAMENTE || ERROR_LEER_PRODUCTOS)
//    productos : vector con los productos leidos (si hubo error está vacío)
//}
export const obtenerProductos = async () => {     
    let resultadoObtenerProductos = {
        mensaje : '',
        productos : []
    }

    //conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();
        try {
            let productos = await bd.collection('productos').find().toArray();
            resultadoObtenerProductos.mensaje = constantesProductos.PRODUCTOS_LEIDOS_CORRECTAMENTE;

            // const unidades = await bd.collection('unidades').find().toArray();
            // ingredientes = agregarNombreUnidades(ingredientes, unidades);
            // Falta completar para que se incluya toda la información de los pedidos
            resultadoObtenerProductos.productos = productos;
            resultadoConectarBD.cliente.close();            
            return resultadoObtenerProductos;
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return {...resultadoObtenerProductos, mensaje : constantesProductos.ERROR_LEER_PRODUCTOS};
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerProductos, mensaje : constantesUnidades.ERROR_CONEXION};
    }    
}

//Verifica si existe un producto con el nombre especificado
//Es un método auxiliar que lo llama agregarProducto() y modificarProducto() (por eso no se lo exporta)
//Se puede usar cuando se está creando un producto (_id sin definir) o cuando se está modificando un producto (_id definido)
//para eso hace una búsqueda insensible a mayúsculas/minúscuulas
//para lo cual crea índices en la colección 'productos' que permiten hacer estas búsquedas
//El índice se crea sobre el atributo 'nombre' en orden ascendente (1),
//utiliza el idioma español ('es') y es insensibles a mayúsculas/minúsculas (2)
//El índice se crea sólo en caso de no existir
//Una vez definido el índice, para que el mismo se use, se lo debe especificar tal cual al momento de hacer la búsqueda
//cliente: conexión a la BD
//nombre: nombre del producto
//_id: sin definir cuando se está creando un producto, definido cuando se está modificando un producto
//Devuelve el resultado de la operación: ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_PRODUCTOS || PRODUCTO_REPETIDO || PRODUCTO_NO_REPETIDO
const existeProducto = async (cliente, nombre, _id) => {  
    if (cliente) { //se pudo establecer la conexión        
        const bd = cliente.db();
       
        //se crean los índices (si no existen)
        try {
            bd.collection('productos').createIndex( 
                { 'nombre' : 1},
                { collation: 
                    {
                        locale : 'es',
                        strength : 2
                    }
                }
            );  
        }
        catch(error) {
            return constantesProductos.ERROR_CREAR_INDICE;
        }

        let productosRepetidos;
        if (_id === undefined) { //creación de producto
            try {
                productosRepetidos = await bd.collection('productos').find({ 
                    nombre : { $eq : nombre }
                }).collation( { locale: 'es', strength: 2 } ).toArray();
            }
            catch(error) {             
                return constantesProductos.ERROR_LEER_PRODUCTOS;
            }
        }
        else { //modificación de producto
            try {                
                productosRepetidos = await bd.collection('productos').find({ 
                    nombre : { $eq : nombre }, 
                    _id : { $ne : _id}
                }).collation( { locale: 'es', strength: 2 } ).toArray();
            }
            catch(error) {
                return constantesProductos.ERROR_LEER_PRODUCTOS;
            }
        }
        return productosRepetidos.length > 0 ? constantesProductos.PRODUCTO_REPETIDO : constantesProductos.PRODUCTO_NO_REPETIDO;
    }
    else { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION; 
    }
}



//Agrega el producto en la colección
//producto: producto a agregar
//mensaje : resultado de la operación (ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_PRODUCTOS || PRODUCTO_REPETIDO || PRODUCTO_NO_REPETIDO || ERROR_GUARDAR_PRODUCTO || PRODUCTO_CREADO
export const agregarProducto = async (producto) => {    
    //Para hacer el agregado:
        //1. Se verifica que no exista otro producto con el mismo nombre (insensible a mayúsculas/minúsculas)
        //2. Se crea el producto en la BD (en el proceso se obtiene el _id)

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        //1. Se verifica que no exista otro producto con el mismo nombre (insensible a mayúsculas/minúsculas)
        const resultadoExisteProducto = await existeProducto(resultadoConectarBD.cliente, producto.nombre);
        
        if (resultadoExisteProducto === constantesProductos.PRODUCTO_NO_REPETIDO) { //no existe un producto con ese nombre

            const bd = resultadoConectarBD.cliente.db();
            try {
                //2. Se crea el producto en la BD (en el proceso se obtiene el _id)
                //primero se convierten en ObjectId los idIngrediente e idUnidad de cada ingrediente
                const ingredientesUpdate = [...producto.ingredientes];
                for(let i in ingredientesUpdate) {
                    ingredientesUpdate[i].idIngrediente = new ObjectId(ingredientesUpdate[i].idIngrediente);
                    ingredientesUpdate[i].idUnidad = new ObjectId(ingredientesUpdate[i].idUnidad);
                }
                producto.ingredientes = ingredientesUpdate;
                const resultadoInsertarProducto = await bd.collection('productos').insertOne(producto);
                //cuando se está creando un producto, no existe _id
                //una vez creado, se obtiene un _id, el cual se recupera en resultadoInsertarProducto.insertedId

                resultadoConectarBD.cliente.close();
                return constantesProductos.PRODUCTO_CREADO;
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return constantesProductos.ERROR_GUARDAR_PRODUCTO;
            }                
        }
        else {//ya existe un producto con ese nombre, o hubo algún error
            resultadoConectarBD.cliente.close();
            return resultadoExisteProducto;
        }
    }
    else {
        return constantesUnidades.ERROR_CONEXION;
    }        
}

//Obtiene el producto con el _id especificado
//También devuelve la lista de productos
//_id: _id a buscar
//Devuelve un objeto de la forma
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || PRODUCTO_NULO || ERROR_LEER_PRODUCTOS || PRODUCTOS_LEIDOS_CORRECTAMENTE)
//    producto : producto con el _id especificado, o null si no se encuentra uno
//    productos : lista de productos (si hubo error está vacía)
//}
export const obtenerProductoParaModificar = async (_id) => {
    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    let resultadoObtenerProducto = {
        mensaje : '',
        producto : null,
        productos : []
    }

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        if (_id) { //se especificó un _id            
            const bd = resultadoConectarBD.cliente.db();
            try {
                let productos = await bd.collection('productos').find({_id: {$eq: _id}}).toArray(); 
                let todosLosProductos = await bd.collection('productos').find().toArray(); 
                resultadoConectarBD.cliente.close();
                return {
                    mensaje : constantesProductos.PRODUCTOS_LEIDOS_CORRECTAMENTE,
                    producto : productos.length === 1 ? productos[0] : null,
                    productos : todosLosProductos
                } 
                //si productos.length === 1 es porque se encontró un único producto
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return {...resultadoObtenerProducto, mensaje : constantesProductos.ERROR_LEER_PRODUCTOS};
            }
        }
        else { //no se especificó un _id
            resultadoConectarBD.cliente.close();
            return {...resultadoObtenerProducto, mensaje : constantesProductos.PRODUCTO_NULO};
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerProducto, mensaje : constantesUnidades.ERROR_CONEXION};
    }
}

//Modifica el producto en la colección
//producto a modificar
//Devuelve el resultado de la operación: ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_PRODUCTOS || PRODUCTO_REPETIDO || ERROR_ACTUALIZAR_PRODUCTO || PRODUCTO_MODIFICADO
export const modificarProducto = async (producto) => {    
    //Para hacer la modificación:
        //1. Se verifica que no exista otro producto con ese nombre (insensible a mayúsculas/minúsculas)
        //2. Se actualiza el producto en la BD

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();

        //1. Se verifica que no exista otro producto con ese nombre (insensible a mayúsculas/minúsculas)
        const resultadoExisteProducto = await existeProducto(resultadoConectarBD.cliente, producto.nombre, producto._id);
        if (resultadoExisteProducto === constantesProductos.PRODUCTO_NO_REPETIDO) { //no existe un producto con ese nombre
            try {                          
                //2. Se actualiza el producto en la BD
                await bd.collection('productos').updateOne({_id : producto._id}, {
                    $set : {
                        foto: producto.foto,
                        nombre : producto.nombre,
                        precio : producto.precio,
                        ingredientes: producto.ingredientes, 
                        pedidos : producto.pedidos,
                    }
                }); 
                resultadoConectarBD.cliente.close();
                return constantesProductos.PRODUCTO_MODIFICADO;
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return constantesProductos.ERROR_ACTUALIZAR_PRODUCTO;
            }
        }
        else {//ya existe un producto con ese nombre, o hubo algún error
            resultadoConectarBD.cliente.close();
            return resultadoExisteProducto;
        }
    }
    else { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION;
    }
}