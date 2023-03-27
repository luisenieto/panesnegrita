import { conectarBD } from "../conexion/conexion";
import { constantes as constantesProductos } from "../../../auxiliares/auxiliaresProductos";
import { constantes as constantesPedidos } from "../../../auxiliares/auxiliaresPedidos";
import { constantes as constantesConexion } from "../../../auxiliares/auxiliaresConexion";
import { ObjectId } from 'mongodb';
import { obtenerCliente } from "../clientes/bdAuxiliares";
import { obtenerPedido } from "../pedidos/bdAuxiliares";
import { existenPedidosConEsteProducto } from "../pedidos/bdAuxiliares";

//*************************** Funciones de ABM y Listado ************************* */

//Agrega el producto en la colección
//Para hacer el agregado:
    //1. Verifica que el nombre del producto no esté en blanco, que el precio sea > 0 y que los ingredientes tengan un id y una unidad 
    //2. Se conecta a la BD
    //3. Verifica que no exista otro producto con el mismo nombre (insensible a mayúsculas/minúsculas)
    //4. Verifica que las unidades de los ingredientes tengan equivalencias, para lo cual primero se transforman en ObjectId los idIngrediente e idUnidad
    //5. Crea el producto en la BD (en el proceso se obtiene el _id)
//Para poder crear un producto, las unidades de sus ingredientes deben tener equivalencias
//con las unidades de los ingredientes en stock
//Por ejemplo, tomar el ingrediente "Manteca" cuya unidad sea "Kg"
//Si el producto lleva por ingrediente "Manteca" con la cantidad expresada en "grs"
//entonces la unidad "grs" debe tener por equivalencia a "Kg"
//de esta forma se podrá decrementar la cantidad en stock del ingrediente "Manteca"
//Si algún ingrediente del producto tiene una unidad que no tiene equivalencia, no se puede crear el producto
//Esto se aplica a los productos cuyos ingredientes sean ingredientes propiamente dichos, no otros productos (el caso de combos)    
//Requiere de las funciones auxiliares:
    //(1) verificarProducto()
    //(2) conectarBD()
    //(3) existeProducto()
    //(4) transformarStringEnIdLosIngredientes() y analizarUnidades()
//Parámetros:
    //producto: producto a agregar
//Devuelve: 
    //constantesProductos.NOMBRE_EN_BLANCO ||
    //constantesProductos.PRECIO_INCORRECTO ||
    //constantesProductos.INGREDIENTE_UNIDAD_NULO || 
    //constantesConexion.ERROR_CONEXION || 
    //constantesProductos.ERROR_CREAR_INDICE || 
    //constantesProductos.ERROR_LEER_PRODUCTOS || 
    //constantesProductos.PRODUCTO_REPETIDO || 
    //constantesProductos.UNIDAD_SIN_EQUIVALENCIA || 
    //constantesProductos.ERROR ||   
    //constantesProductos.ERROR_GUARDAR_PRODUCTO || 
    //constantesProductos.PRODUCTO_CREADO
export const agregarProducto = async (producto) => {             
    //1. Verifica que el nombre del producto no esté en blanco y que los ingredientes tengan un id y una unidad 
    const resultadoVerificacion = verificarProducto(producto.nombre, producto.precio, producto.ingredientes);

    if (resultadoVerificacion !== constantesProductos.VERIFICACION_OK) 
        return resultadoVerificacion;

    //2. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //3. Verifica que no exista otro producto con el mismo nombre (insensible a mayúsculas/minúsculas)
    const resultadoExisteProducto = await existeProducto(resultadoConectarBD.cliente, producto.nombre);
    
    if (resultadoExisteProducto !== constantesProductos.PRODUCTO_NO_REPETIDO) { //ya existe un producto con ese nombre, o hubo algún error
        resultadoConectarBD.cliente.close();
        return resultadoExisteProducto;
    }

    //4. Verifica que las unidades de los ingredientes tengan equivalencias 
    const ingredientesUpdate = transformarStringEnIdLosIngredientes(producto.ingredientes);
    producto.ingredientes = ingredientesUpdate;

    const resultadoAnalizarUnidades = await analizarUnidades(resultadoConectarBD.cliente, producto.ingredientes);
    if (resultadoAnalizarUnidades !== constantesProductos.UNIDADES_CON_EQUIVALENCIAS) {
        resultadoConectarBD.cliente.close();
        return resultadoAnalizarUnidades;
    }

    const bd = resultadoConectarBD.cliente.db();    
    try {
        //5. Se crea el producto en la BD (en el proceso se obtiene el _id)
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


//Borra el producto especificado
//Para hacer el borrado:
    //1. Se conecta a la BD
    //2. Verifica que no haya pedidos con el mismo
    //3. Borra de la BD el producto
//Requiere de las funciones auxiliares:
    //(1) conectarBD()
    //(2) existePedidoConEsteProducto()
//Parámetros:
    //cliente: producto a borrar
//Devuelve:
    //constantesConexion.ERROR_CONEXION || 
    //constantesPedidos.ERROR_LEER_PEDIDOS || 
    //constantesPedidos.PEDIDOS_CON_EL_PRODUCTO ||
    //constantesProductos.ERROR_BORRAR_PRODUCTO || 
    //constantesProductos.PRODUCTO_BORRADO
export const borrarProducto = async (producto) => {

    //1. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //2. Verifica que no haya pedidos con el mismo
    const bd = resultadoConectarBD.cliente.db();

    const hayPedidosConEsteProducto = await existenPedidosConEsteProducto(resultadoConectarBD.cliente, new ObjectId(producto._id));
    if (hayPedidosConEsteProducto === constantesPedidos.PEDIDOS_CON_EL_PRODUCTO) {
        resultadoConectarBD.cliente.close();
        return hayPedidosConEsteProducto;
    }
    
    //3. Borra de la BD el producto
        
    try {  
        await bd.collection('productos').deleteOne({ "_id" : new ObjectId(producto._id) });
        resultadoConectarBD.cliente.close();
        return constantesProductos.PRODUCTO_BORRADO;
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return constantesProductos.ERROR_BORRAR_PRODUCTO;
    }       
}

    

//Modifica el producto en la colección
//Para hacer la modificación:
    //1. Verifica que el nombre del producto no esté en blanco, que el precio sea > 0 y que los ingredientes tengan un id y una unidad 
    //2. Se conecta a la BD
    //3. Verifica que no exista otro producto con el mismo nombre (insensible a mayúsculas/minúsculas)
    //4. Verifica que las unidades de los ingredientes tengan equivalencias, para lo cual primero se transforman en ObjectId los idIngrediente e idUnidad
    //5. Actualiza el producto en la BD
//Requiere de las funciones auxiliares:
    //(1) verificarProducto()
    //(2) conectarBD()
    //(3) existeProducto()
    //(4) transformarStringEnIdLosIngredientes() y analizarUnidades()
//Parámetros:
    //producto: producto a modificar
//Devuelve: 
    //constantesProductos.NOMBRE_EN_BLANCO ||
    //constantesProductos.PRECIO_INCORRECTO ||
    //constantesProductos.INGREDIENTE_UNIDAD_NULO || 
    //constantesConexion.ERROR_CONEXION || 
    //constantesProductos.ERROR_CREAR_INDICE || 
    //constantesProductos.ERROR_LEER_PRODUCTOS || 
    //constantesProductos.PRODUCTO_REPETIDO || 
    //constantesProductos.UNIDAD_SIN_EQUIVALENCIA || 
    //constantesProductos.ERROR ||   
    //constantesProductos.ERROR_ACTUALIZAR_PRODUCTO || 
    //constantesProductos.PRODUCTO_MODIFICADO
export const modificarProducto = async (producto) => {    
    //1. Verifica que el nombre del producto no esté en blanco y que los ingredientes tengan un id y una unidad 
    const resultadoVerificacion = verificarProducto(producto.nombre, producto.precio, producto.ingredientes);

    if (resultadoVerificacion !== constantesProductos.VERIFICACION_OK) 
        return resultadoVerificacion;

    //2. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //3. Verifica que no exista otro producto con el mismo nombre (insensible a mayúsculas/minúsculas)
    const resultadoExisteProducto = await existeProducto(resultadoConectarBD.cliente, producto.nombre, producto._id);

    if (resultadoExisteProducto !== constantesProductos.PRODUCTO_NO_REPETIDO) { //ya existe un producto con ese nombre, o hubo algún error
        resultadoConectarBD.cliente.close();
        return resultadoExisteProducto;
    }

    //4. Verifica que las unidades de los ingredientes tengan equivalencias 
    const ingredientesUpdate = transformarStringEnIdLosIngredientes(producto.ingredientes);
    producto.ingredientes = ingredientesUpdate;

    const resultadoAnalizarUnidades = await analizarUnidades(resultadoConectarBD.cliente, producto.ingredientes);
    if (resultadoAnalizarUnidades !== constantesProductos.UNIDADES_CON_EQUIVALENCIAS) {
        resultadoConectarBD.cliente.close();
        return resultadoAnalizarUnidades;
    }
    
    //5. Actualiza el producto en la BD
    const bd = resultadoConectarBD.cliente.db();
    try {                          
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

//Obtiene todos los productos, junto con los datos de los pedidos
//Todos los productos tienen un vector de pedidos donde sólo se guardan los ids de los mismos
//Entonces, para cada producto, se arma un vector para los pedidos que tiene la forma:
//[
//  {
//      _id: id del pedido,
//      idCliente: id del cliente,
//      idProducto: id del producto (redundante ya que se tiene el producto. Este dato viene de los pedidos),
//      cantidad: cantidad del producto que forma el pedido,
//      importe: importe del pedido,
//      fecha: fecha en que se realizó el pedido,
//      estado: estado del pedido,
//      apellido: apellido del cliente que hizo el pedido,
//      nombre: nombre del cliente que hizo el pedido,
//  },
//  {
//      ...    
//  }
//]
//Para obtener los productos:
    //1. Se conecta a la BD
    //2. Obtiene los productos
    //3. Arma el vector de pedidos para cada producto
//Requiere de las funciones auxiliares:
    //(1) conectarBD()
    //(3) obtenerPedido()
    //(3) obtenerCliente()
//Devuelve: 
    //{
    //    mensaje : constantesConexion.ERROR_CONEXION || constantesProductos.PRODUCTOS_LEIDOS_CORRECTAMENTE || constantesProductos.ERROR_LEER_PRODUCTOS)
    //    productos : vector con los productos leidos (si hubo error está vacío)
    //}
export const obtenerProductos = async () => {     
    let resultadoObtenerProductos = {
        mensaje : '',
        productos : []
    }

    //1. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesConexion.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();
        try {
            //2. Obtiene los productos
            let productos = await bd.collection('productos').find().toArray();

            //3. Arma el vector de pedidos para cada producto
            let todosLosPedidos = await bd.collection('pedidos').find().toArray();            
            let todosLosClientes = await bd.collection('clientes').find().toArray();

            for(let i in productos) {
                const pedidos = productos[i].pedidos; //tiene sólo los ids de los pedidos de un producto
                let pedidosUpdate = [];
                for(let j in pedidos) { //se recorren los pedidos de cada producto
                    const datosPedido = obtenerPedido(pedidos[j], todosLosPedidos);
                    const datosCliente = obtenerCliente(datosPedido.idCliente, todosLosClientes);
                    pedidosUpdate.push({
                        ...datosPedido,
                        apellido : datosCliente.apellido, 
                        nombre : datosCliente.nombre
                    });
                }
                productos[i].pedidos = pedidosUpdate;
            }

            resultadoObtenerProductos.mensaje = constantesProductos.PRODUCTOS_LEIDOS_CORRECTAMENTE;
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
        return {...resultadoObtenerProductos, mensaje : resultadoConectarBD.mensaje};
    }    
}

//Obtiene el producto con el _id especificado, o null si no encuentra uno
//También devuelve la lista de productos
//Todos los productos tienen un vector de pedidos donde sólo se guardan los ids de los mismos
//Entonces, para cada producto, se arma un vector para los pedidos que tiene la forma:
//[
//  {
//      _id: id del pedido,
//      idCliente: id del cliente,
//      idProducto: id del producto (redundante ya que se tiene el producto. Este dato viene de los pedidos),
//      cantidad: cantidad del producto que forma el pedido,
//      importe: importe del pedido,
//      fecha: fecha en que se realizó el pedido,
//      estado: estado del pedido,
//      apellido: apellido del cliente que hizo el pedido,
//      nombre: nombre del cliente que hizo el pedido,
//  },
//  {
//      ...    
//  }
//]
//Para obtener el producto:
    //1. Verifica que se haya especificado un _id
    //2. Si se especificó un _id, se conecta a la BD
    //3. Obtiene el producto para el _id especificado
//Requiere de las funciones auxiliares:
    //(2) conectarBD()    
//Parámetros:
    //_id: _id del producto a buscar
//Devuelve:
    //{
    //    mensaje : constantesConexion.ERROR_CONEXION || constantesProductos.PRODUCTO_NULO || constantesProductos.ERROR_LEER_PRODUCTOS || constantesProductos.PRODUCTOS_LEIDOS_CORRECTAMENTE
    //    producto : producto con el _id especificado, o null si no se encuentra uno
    //    productos : lista de productos (si hubo error está vacía)
    //}
export const obtenerProductoParaModificar = async (_id) => {
    let resultadoObtenerProducto = {
        mensaje : '',
        producto : null,
        productos : []
    }

    //1. Verifica que se haya especificado un _id
    if (!_id) { //no se especificó un _id            
        return {...resultadoObtenerProducto, mensaje : constantesProductos.PRODUCTO_NULO};        
    }

    //2. Si se especificó un _id, se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //3. Obtiene el producto para el _id especificado
    const bd = resultadoConectarBD.cliente.db();
    try {
        let productos = await bd.collection('productos').find({_id: {$eq: _id}}).toArray(); 
        let producto = productos.length === 1 ? productos[0] : null;
        //si productos.length === 1 es porque se encontró un único producto
        
        if (producto) { //si existe el producto, se arma su vector de pedidos igual que para el método obtenerProductos()
            let todosLosPedidos = await bd.collection('pedidos').find().toArray();
            //sirve para armar el vector de pedidos de los productos
    
            let todosLosClientes = await bd.collection('clientes').find().toArray();
            //sirve para armar el vector de pedidos de los productos

            const pedidos = producto.pedidos; //tiene sólo los ids de los pedidos de un producto
            let pedidosUpdate = [];
            for(let j in pedidos) { //se recorren los pedidos de cada producto
                const datosPedido = obtenerPedido(pedidos[j], todosLosPedidos);
                const datosCliente = obtenerCliente(datosPedido.idCliente, todosLosClientes);
                pedidosUpdate.push({
                    ...datosPedido,
                    apellido : datosCliente.apellido, 
                    nombre : datosCliente.nombre
                });
            }
            producto.pedidos = pedidosUpdate;
        }
        let todosLosProductos = await bd.collection('productos').find().toArray(); 
        resultadoConectarBD.cliente.close();
        return {
            mensaje : constantesProductos.PRODUCTOS_LEIDOS_CORRECTAMENTE,
            producto : producto,
            productos : todosLosProductos
        }         
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return {...resultadoObtenerProducto, mensaje : constantesProductos.ERROR_LEER_PRODUCTOS};
    }
}


//*************************** Funciones auxiliares ************************* */


//Analiza las unidades de los ingredientes del producto:
//la unidad de cada ingrediente del producto debe tener una equivalencia
//con la unidad del ingrediente en stock      
//Requiere de las funciones auxiliares:
    //obtenerIngredienteEnStock()
    //obtenerIngredienteActualizado() ************* ya no
    //obtenerEquivalencia()
//Parámetros:
    //cliente: conexión a la BD
    //ingredientes: ingredientes del producto
//Devuelve:
    //{
        //constantesProductos.UNIDADES_CON_EQUIVALENCIAS || 
        //constantesProductos.UNIDAD_SIN_EQUIVALENCIA || 
        //constantesProductos.ERROR
    //}
const analizarUnidades = async (cliente, ingredientes) => {
    let resultadoAnalisisUnidades = constantesProductos.UNIDADES_CON_EQUIVALENCIAS;

    try {
        //Se analizan cada uno de los ingredientes del producto:
        for(let i in ingredientes) {                
            const idIngredienteDelProducto = ingredientes[i].idIngrediente;
            const cantidadIngredienteDelProducto = ingredientes[i].cantidad;
            const idUnidadIngredienteDelProducto = ingredientes[i].idUnidad;

            //Se obtiene el ingrediente en stock
            //No se usa el método obtenerIngredienteParaModificar() porque este abre y cierra la conexión
            const ingredienteEnStock = await obtenerIngredienteEnStock(cliente, idIngredienteDelProducto);
            
            if (ingredienteEnStock) { //se trata de un ingrediente, no de un producto
                const idUnidadIngredienteEnStock = ingredienteEnStock.idUnidad; //es la unidad del ingrediente en stock
                if (!idUnidadIngredienteDelProducto.equals(idUnidadIngredienteEnStock)) { //Si la unidad del ingrediente del producto no es la misma que la del ingrediente en stock hay que buscar si tiene equivalencia
                    const equivalencia = await obtenerEquivalencia(cliente, idUnidadIngredienteDelProducto, idUnidadIngredienteEnStock);
                    if (!equivalencia) {
                        resultadoAnalisisUnidades = constantesProductos.UNIDAD_SIN_EQUIVALENCIA;
                        break;
                    }
                }                
            }                
        }
        return resultadoAnalisisUnidades;
    }
    catch(error) {
        resultadoAnalisisUnidades = constantesProductos.ERROR;
        return resultadoAnalisisUnidades;
    }
}


//Verifica si existe un producto con el nombre especificado
//Es un método auxiliar que lo llama agregarProducto() y modificarProducto() (por eso no se lo exporta)
//Se puede usar cuando se está creando un producto (_id sin definir) o cuando se está modificando un producto (_id definido)
//Para esto hace una búsqueda insensible a mayúsculas/minúscuulas
//para lo cual crea un índice (sólo en caso de no existir) en la colección 'productos' que permite hacer esta búsqueda
//El índice se crea sobre el atributo 'nombre' en orden ascendente (1),
//utiliza el idioma español ('es') y es insensibles a mayúsculas/minúsculas (2)
//Una vez definido el índice, para que el mismo se use, se lo debe especificar tal cual al momento de hacer la búsqueda
//Parámetros:
    //cliente: conexión a la BD
    //nombre: nombre del producto
    //_id: sin definir cuando se está creando un producto, definido cuando se está modificando un producto
//Devuelve:
    //constantesConexion.ERROR_CONEXION || 
    //constantesProductos.ERROR_CREAR_INDICE || 
    //constantesProductos.ERROR_LEER_PRODUCTOS || 
    //constantesProductos.PRODUCTO_REPETIDO || 
    //constantesProductos.PRODUCTO_NO_REPETIDO
const existeProducto = async (cliente, nombre, _id) => {  
    if (!cliente) { //no se pudo establecer la conexión        
        return constantesConexion.ERROR_CONEXION; 
    }

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

//Verifica si existe un producto cuyos ingredientes tengan la unidad especificada
//Es un método auxiliar que lo llama borrarUnidad() 
//Para hacer la verificación:
    //1. Verifica que se haya establecido la conexión a la BD
    //2. Realiza la verificación
//Parámetros:
    //cliente: conexión a la BD
    //idUnidad: _id de la unidad a buscar
//Devuelve: 
    //constantesConexion.ERROR_CONEXION || 
    //constantesProductos.ERROR_LEER_PRODUCTOS || 
    //constantesProductos.PRODUCTOS_CON_LA_UNIDAD ||
    //constantesProductos.PRODUCTOS_SIN_LA_UNIDAD
export const existeProductoConEstaUnidad = async (cliente, idUnidad) => {  

    //1. Verifica que se haya establecido la conexión a la BD  
    if (!cliente) { //se pudo establecer la conexión
        return constantesConexion.ERROR_CONEXION; 
    }

    //2. Realiza la verificación
    const bd = cliente.db();

    let productosConEstaUnidad;
    try {
        productosConEstaUnidad = await bd.collection('productos').find({ "ingredientes.idUnidad" : { $eq : idUnidad} }).toArray();
    }
    catch(error) {
        return constantesProductos.ERROR_LEER_PRODUCTOS;
    }
    
    return productosConEstaUnidad.length > 0 ? constantesProductos.PRODUCTOS_CON_LA_UNIDAD : constantesProductos.PRODUCTOS_SIN_LA_UNIDAD;             
}


//Verifica si existe un producto cuyos ingredientes tengan el ingrediente especificado
//Es un método auxiliar que lo llama borrarIngrediente() 
//Para hacer la verificación:
    //1. Verifica que se haya establecido la conexión a la BD
    //2. Realiza la verificación
//Parámetros:
    //cliente: conexión a la BD
    //idIngrediente: _id del ingrediente a buscar
//Devuelve: 
    //constantesConexion.ERROR_CONEXION || 
    //constantesProductos.ERROR_LEER_PRODUCTOS || 
    //constantesProductos.PRODUCTOS_CON_EL_INGREDIENTE ||
    //constantesProductos.PRODUCTOS_SIN_EL_INGREDIENTE
export const existeProductoConEsteIngrediente = async (cliente, idIngrediente) => {  

    //1. Verifica que se haya establecido la conexión a la BD  
    if (!cliente) { //se pudo establecer la conexión
        return constantesConexion.ERROR_CONEXION; 
    }

    //2. Realiza la verificación
    const bd = cliente.db();

    let productosConEsteIngrediente;
    try {
        productosConEsteIngrediente = await bd.collection('productos').find({ "ingredientes.idIngrediente" : { $eq : idIngrediente} }).toArray();
    }
    catch(error) {
        return constantesProductos.ERROR_LEER_PRODUCTOS;
    }
    
    return productosConEsteIngrediente.length > 0 ? constantesProductos.PRODUCTOS_CON_EL_INGREDIENTE : constantesProductos.PRODUCTOS_SIN_EL_INGREDIENTE;             
}
    
//Dada una unidad, identificada por su _id, obtiene la equivalencia (proporción) de la unidad identificada por su idUnidadEquivalente
//Por ejemplo, dada la unidad "grs", obtiene la proporción de la unidad "Kg" (1 grs = 0.001 Kg)
//Si no se encuentra una equivalencia, devuelve null
//Es un método auxiliar llamado por analizarUnidades(), por eso no se lo exporta
//Parámetros:
    //cliente: conexión a la BD
    //_id: id de la unidad a la cual se busca su equivalencia (proporción) (sería el id de "grs")
    //idUnidadEquivalente: id de la unidad equivalente (sería el id de "Kg")
//Devuelve:
    //proporción de la unidad de equivalencia (sería 0.001), o null
const obtenerEquivalencia = async (cliente, _id, idUnidadEquivalente) => {
    const unidades = await cliente.db().collection('unidades').find({_id: {$eq: _id}}).toArray();    
    const unidad = unidades[0];
    for(let i in unidad.equivalencias) {
        if (unidad.equivalencias[i]._id.equals(idUnidadEquivalente))
            return unidad.equivalencias[i].proporcion;
    }
    return null;
}

//Obtiene el ingrediente en stock
//El producto podría ser un combo, con lo cual sus ingredientes serían otros productos
//Entonces se debe verificar que el ingrediente del producto sea un ingrediente propiamente dicho:
//si es, se lo devuelve, y si no se devuelve null
//Es un método auxiliar llamado por analizarUnidades() y actualizarIngredientes(), por eso se lo debe exportar
//Parámetros:
    //cliente: conexión a la BD
    //idIngrediente: id del ingrediente que se busca
//Devuelve:
    //objeto Ingrediente correspondiente al id especificado, o null si no se encuentra uno
export const obtenerIngredienteEnStock = async (cliente, idIngrediente) => {
    const ingredientes = await cliente.db().collection('ingredientes').find({_id: {$eq: idIngrediente}}).toArray(); 
    return ingredientes.length === 1 ? ingredientes[0] : null;
}

//Dado un producto identificado por su _id,
//devuelve el objeto Producto correspondiente, el cual se busca en el vector "productos"
//Si no se encuentra el _id, devuelve null
//Es un método auxiliar llamado por verificarPedido()
//Parámetros:
	//_id: id del producto
    //clientes: vector de productos
//Devuelve:
    //objeto Producto, o null
export const obtenerProducto = (_id, productos) => {
    for(let i in productos) {
        if (productos[i]._id.equals(_id))
            return productos[i];
    }
    return null;
}

//Dado el vector de ingredientes, transforma los _id en ObjectId
//Parámetros:
    //ingredientes: vector de ingredientes con los _id como string
//Devuelve:
    //vector de ingredientes con los _id transformados a ObjectId    
export const transformarStringEnIdLosIngredientes = (ingredientes) => {
    let ingredientesUpdate = [];

    for(let i in ingredientes) 
        ingredientesUpdate.push({
            ...ingredientes[i], 
            idIngrediente : new ObjectId(ingredientes[i].idIngrediente),
            idUnidad : new ObjectId(ingredientes[i].idUnidad)
    });
    
    return ingredientesUpdate;
}

//Verifica que:
    //1. El nombre del producto no esté en blanco
    //2. El precio del producto sea > 0
    //3. Los ingredientes del producto tengan un id y una unidad, y que la cantidad de los mismos sea > 0
//Parámetros:
    //nombre: nombre del producto
    //precio: precio del producto
    //ingredientes: ingredientes del producto 
//Devuelve:
    //constantesProductos.NOMBRE_EN_BLANCO ||
    //constantesProductos.PRECIO_INCORRECTO ||
    //constantesProductos.INGREDIENTE_UNIDAD_NULO || 
    //constantesProductos.CANTIDAD_ERROR ||
    //constantesProductos.VERIFICACION_OK
const verificarProducto = (nombre, precio, ingredientes) => {
    //Se verifica que el nombre del producto no esté en blanco
    if (nombre === '') {
        return constantesProductos.NOMBRE_EN_BLANCO;
    } 

    //Se verifica que el precio del producto no sea <= 0
    if (precio <= 0) {
        return constantesProductos.PRECIO_INCORRECTO;
    }

    //Se verifica que los ingredientes del producto tengan un id y una unidad, y que la cantidad de los mismos sea > 0
    for(let i in ingredientes) {
        if (ingredientes[i].idIngrediente === null || ingredientes[i].idUnidad === null) {
            return constantesProductos.INGREDIENTE_UNIDAD_NULO;
        }

        if (ingredientes[i].cantidad <= 0) {
            return constantesProductos.CANTIDAD_ERROR;
        }
    }

    return constantesProductos.VERIFICACION_OK;
}

