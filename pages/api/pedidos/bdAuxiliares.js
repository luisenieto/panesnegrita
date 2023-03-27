import { conectarBD } from "../conexion/conexion";
import { constantes as constantesConexion } from "../../../auxiliares/auxiliaresConexion";
import { constantes as constantesUnidades } from "../../../auxiliares/auxiliaresUnidades";
import { constantes as constantesPedidos } from "../../../auxiliares/auxiliaresPedidos";
import { obtenerCliente } from "../clientes/bdAuxiliares";
import { obtenerProducto } from "../productos/bdAuxiliares";
import { obtenerIngredienteEnStock } from "../productos/bdAuxiliares";
import { obtenerProductoParaModificar } from "../productos/bdAuxiliares";
import { obtenerIngredienteParaModificar } from "../ingredientes/bdAuxiliares";
import { ObjectId } from 'mongodb';


//*************************** Funciones de ABM y Listado ************************* */

//Agrega el pedido en la colección
//Para hacer el agregado:
    //1. Se conecta a la BD
    //2. Obtiene todos los productos y todos los clientes (necesario para poder verificar el pedido)        
    //3. Verifica que se haya especificado un cliente, y que el mismo exista, la cantidad del producto sea > 0, se haya especificado un producto, y que el mismo exista    
    //4. Crea el pedido en la BD (en el proceso se obtiene el _id)
    //5. Agrega el pedido al conjunto de pedidos del producto
    //6. Agrega el pedido al conjunto de pedidos del cliente
    //7. Actualiza en la BD las cantidades en stock de los distintos ingredientes
//Requiere de las funciones auxiliares:
    //(1) conectarBD()
    //(3) verificarPedido()
    //(5) agregarPedidoAlProducto()
    //(6) agregarPedidoAlCliente()
    //(7) actualizarIngredientes()
//Parámetros:
    //pedido: pedido a agregar
//Devuelve:    
    //constantesConexion.ERROR_CONEXION || 
    //constantesConexion.ERROR_LEER_CLIENTES_PRODUCTOS ||
    //constantesPedidos.ERROR_GUARDAR_PEDIDO ||
    //constantesPedidos.PEDIDO_CREADO || 
    //constantesPedidos.PRODUCTO_SIN_ESPECIFICAR ||
    //constantesPedidos.PRODUCTO_INEXISTENTE ||
    //constantesPedidos.CANTIDAD_INCORRECTA ||
    //constantesPedidos.ERROR_ACTUALIZAR_PRODUCTO ||
    //constantesPedidos.CLIENTE_SIN_ESPECIFICAR ||
    //constantesPedidos.CLIENTE_INEXISTENTE ||
    //constantesPedidos.ERROR_ACTUALIZAR_CLIENTE ||
    //constantesPedidos.ERROR_OBTENER_EQUIVALENCIA ||
    //constantesPedidos.ERROR_ACTUALIZAR_INGREDIENTES ||
    //constantesPedidos.PEDIDO_CREADO
export const agregarPedido = async (pedido) => {    
    //1. Se conecta a la BD    
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //2. Obtiene todos los productos y todos los clientes (necesario para poder verificar el pedido)        
    const bd = resultadoConectarBD.cliente.db();
    let productos; 
    let clientes;
    try {
        productos = await bd.collection('productos').find({_id: {$eq: pedido.idProducto}}).toArray(); 
        clientes = await bd.collection('clientes').find({_id: {$eq: pedido.idCliente}}).toArray(); 
    }
    catch(Error) {
        return constantesPedidos.ERROR_LEER_CLIENTES_PRODUCTOS;
    }
    
    //3. Verifica que se haya especificado un cliente, y que el mismo exista, la cantidad del producto sea > 0, se haya especificado un producto, y que el mismo exista    
    const producto = productos[0];
    //Como ya se verificó que el objeto Pedido, siempre se encontrará un producto
    const resultadoVerificacion = verificarPedido(pedido.idCliente, pedido.cantidad, pedido.idProducto, clientes, productos);
    
    if (resultadoVerificacion !== constantesPedidos.VERIFICACION_OK) 
        return resultadoVerificacion;

    //4. Crea el pedido en la BD (en el proceso se obtiene el _id)
        
    let resultadoInsertarPedido;
    try {
        resultadoInsertarPedido = await bd.collection('pedidos').insertOne(pedido);
        //cuando se está creando un pedido, no existe _id
        //una vez creado, se obtiene un _id, el cual se recupera en resultadoInsertarPedido.insertedId
    }
    catch(Error) {
        resultadoConectarBD.cliente.close();
        return constantesPedidos.ERROR_GUARDAR_PEDIDO;
    }
    
    //5. Agrega el pedido al conjunto de pedidos del producto
    
    const resultadoAgregarPedidoAlProducto = await agregarPedidoAlProducto(bd, producto, resultadoInsertarPedido.insertedId);

    if (resultadoAgregarPedidoAlProducto !== constantesPedidos.PRODUCTO_ACTUALIZADO) { //no se pudo agregar el pedido al conjunto de pedidos del producto
        resultadoConectarBD.cliente.close();
        return resultadoAgregarPedidoAlProducto;
    }

    //6. Agrega el pedido al conjunto de pedidos del cliente
    const cliente = clientes[0];
    //Como ya se verificó que el objeto Pedido, siempre se encontrará un producto
    const resultadoAgregarPedidoAlCliente = await agregarPedidoAlCliente(bd, cliente, resultadoInsertarPedido.insertedId);

    if (resultadoAgregarPedidoAlCliente !== constantesPedidos.CLIENTE_ACTUALIZADO) {
        resultadoConectarBD.cliente.close();
        return resultadoAgregarPedidoAlCliente;

    }

    //7. Actualiza en la BD las cantidades en stock de los distintos ingredientes
    const resultadoActualizarIngredientes = await actualizarIngredientes(bd, producto);

    resultadoConectarBD.cliente.close();
    return resultadoActualizarIngredientes === constantesPedidos.INGREDIENTES_ACTUALIZADOS
        ?
            constantesPedidos.PEDIDO_CREADO
        :
            resultadoActualizarIngredientes
}


//Modifica el pedido en la colección
//Si el estado del pedido es "Entregado", lo saca del conjunto de pedidos del producto
//pedido a modificar
//Devuelve el resultado de la operación: ERROR_CONEXION || ERROR_ACTUALIZAR_PEDIDO || PEDIDO_MODIFICADO
export const modificarPedido = async (pedido) => {    

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();

        try {                    
            await bd.collection('pedidos').updateOne({_id : pedido._id}, {
                $set : {
                    idCliente: pedido.idCliente,
                    idProducto : pedido.idProducto,
                    cantidad : pedido.cantidad,
                    importe: pedido.importe, 
                    fecha : pedido.fecha,
                    estado : pedido.estado,
                }
            }); 
            if (pedido.estado === constantesPedidos.ESTADO_ENTREGADO) {
                const productos = await bd.collection('productos').find({_id: {$eq: pedido.idProducto}}).toArray();
                const productoDelPedido = productos[0];
                const index = productoDelPedido.pedidos.indexOf(pedido._id);
                productoDelPedido.pedidos.splice(index, 1);
                await bd.collection('productos').updateOne({_id : pedido.idProducto}, {
                    $set : {
                        pedidos: productoDelPedido.pedidos,
                    }
                });
            }
            resultadoConectarBD.cliente.close();
            return constantesPedidos.PEDIDO_MODIFICADO;
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return constantesPedidos.ERROR_ACTUALIZAR_PEDIDO;
        }
    }
    else { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION;
    }
}


//*************************** Funciones auxiliares ************************* */

//Actualiza los ingredientes en la BD con los nuevos valores de stock
//Para actualizar los ingredientes:
    //1. Verifica que se haya establecido la conexión a la BD  
    //2. Obtiene los ingredientes del producto del pedido
    //3. Se actualizan los ingredientes del producto del pedido (siempre que los ingredientes sean ingredientes, y no productos):
        //Si la unidad del ingrediente del producto del pedido es la misma que la del ingrediente en stock
    	//hay que disminuir de la cantidad en stock la cantidad del ingrediente
		//Por ejemplo, tomar el ingrediente "Manteca", cuya unidad sea "grs", y que en stock hubiera 500 grs
        //Si un producto lleva 100 grs de manteca, cuando se haga un pedido se debe disminuir en 100 grs el stock

        //Si la unidad del ingrediente del producto del pedido no es la misma que la del ingrediente en stock hay que buscar la equivalencia
        //Por ejemplo, tomar el ingrediente "Manteca", cuya unidad sea "Kg", y que en stock hubiera 1 Kg
        //Si un producto lleva 100 "grs" de manteca, hay que buscar la equivalencia entre "Kg" y "grs" (1 "grs" = X "Kg": 0.001 para este ejemplo)
        //Luego, al producto habrá que disminuirle el stock en: equivalencia * cantidad del ingrediente (0.001 * 100 = 0.1)
        //Por lo que el stock quedará en 1 - 0.1 = 0.9 Kg        
//Requiere de las funciones auxiliares:
    //(3) obtenerIngredienteEnStock()
    //(3) obtenerIngredienteActualizado()
    //(3) obtenerEquivalencia()
//Parámetros:
    //bd: conexión a la BD
    //producto: producto cuyos ingredientes se actualizarán en stock
//Devuelve:
    //constantesConexion.ERROR_CONEXION ||
    //constantesPedidos.ERROR_OBTENER_EQUIVALENCIA ||
    //constantesPedidos.INGREDIENTES_ACTUALIZADOS ||
    //constantesPedidos.ERROR_ACTUALIZAR_INGREDIENTES
const actualizarIngredientes = async (bd, producto) => {

    //1. Verifica que se haya establecido la conexión a la BD  
    if (!bd) { //se pudo establecer la conexión
        return constantesConexion.ERROR_CONEXION; 
    }

    //2. Obtiene los ingredientes del producto del pedido
    const ingredientes = producto.ingredientes; 

    //3. Se actualizan los ingredientes del producto del pedido (siempre que los ingredientes sean ingredientes, y no productos):
    let ingredientesAModificar = [];
    for(let i in ingredientes) {
        const idIngredienteDelProductoDelPedido = ingredientes[i].idIngrediente;
        const cantidadIngredienteDelProductoDelPedido = ingredientes[i].cantidad;
        const idUnidadIngredienteDelProductoDelPedido = ingredientes[i].idUnidad;

        //Se obtiene el ingrediente en stock
	    //No se usa el método obtenerIngredienteParaModificar() porque este abre y cierra la conexión
        const ingredienteEnStock = await obtenerIngredienteEnStock(bd, idIngredienteDelProductoDelPedido);

        if (!ingredienteEnStock) { //no se trata de un ingrediente, sino de un producto
            break;
        }

        const idUnidadIngredienteEnStock = ingredienteEnStock.idUnidad; //es la unidad del ingrediente en stock

        if (idUnidadIngredienteDelProductoDelPedido.equals(idUnidadIngredienteEnStock)) { 
            //unidades iguales
            ingredientesAModificar.push(obtenerIngredienteActualizado(ingredienteEnStock, cantidadIngredienteDelProductoDelPedido));
        }
        else {
            //unidades distintas
            const equivalencia = await obtenerEquivalencia(bd, idUnidadIngredienteDelProductoDelPedido, idUnidadIngredienteEnStock);
            if (equivalencia)            
                ingredientesAModificar.push(obtenerIngredienteActualizado(ingredienteEnStock, equivalencia * cantidadIngredienteDelProductoDelPedido));                            
            else
                return constantesPedidos.ERROR_OBTENER_EQUIVALENCIA;                
        }
    }

    try {
        for(let i in ingredientesAModificar) {
            const ingrediente = ingredientesAModificar[i];
            await bd.collection('ingredientes').updateOne({_id : ingrediente._id}, {
                $set : {                
                    stock : ingrediente.stock                
                }
            });
        }    
        return constantesPedidos.INGREDIENTES_ACTUALIZADOS;
    }
    catch(Error) {
        return constantesPedidos.ERROR_ACTUALIZAR_INGREDIENTES;
    }
}




//Dado un pedido, agrega al mismo al conjunto de pedidos del cliente
//Es un método auxiliar llamado por agregarPedido()
//Para agregar el pedido:
    //1. Verifica que se haya establecido la conexión a la BD  
    //2. Actualiza en memoria el cliente con el conjunto de pedidos actualizado
    //3. Actualiza en la BD el cliente con el conjunto de pedidos actualizado
//Parámetros:
    //bd: conexión a la BD
    //cliente: cliente al cual se le agregará el pedido
    //idPedido: id del pedido a agregar
//Devuelve:
    //constantesConexion.ERROR_CONEXION ||
    //constantesPedidos.CLIENTE_SIN_ESPECIFICAR ||
    //constantesPedidos.CLIENTE_ACTUALIZADO ||    
    //constantesPedidos.ERROR_ACTUALIZAR_CLIENTE
const agregarPedidoAlCliente = async (bd, cliente, idPedido) => {
    //1. Verifica que se tenga la conexión a la BD  
    if (!bd) { //se pudo establecer la conexión
        return constantesConexion.ERROR_CONEXION; 
    }

    //2. Actualiza en memoria el cliente con el conjunto de pedidos actualizado
    let pedidosUpdate = [];
    try {
        if (cliente) {  //se especificó un cliente
            pedidosUpdate = [...cliente.pedidos];
            pedidosUpdate.push(idPedido);
        }
        else {
            return constantesPedidos.CLIENTE_SIN_ESPECIFICAR;
        }        
    }
    catch(Error) {
        return constantesPedidos.ERROR_LEER_CLIENTES;
    }

    //3. Actualiza en la BD el cliente con el conjunto de pedidos actualizado
    try {
        await bd.collection('clientes').updateOne({_id : cliente._id}, {
            $set : {                    
                pedidos : pedidosUpdate
            }
        });
        return constantesPedidos.CLIENTE_ACTUALIZADO;
    }
    catch(Error) {
        return constantesPedidos.ERROR_ACTUALIZAR_CLIENTE;
    }
}

//Dado un pedido, agrega al mismo al conjunto de pedidos del producto
//Es un método auxiliar llamado por agregarPedido()
//Para agregar el pedido:
    //1. Verifica que se haya establecido la conexión a la BD  
    //2. Actualiza en memoria el producto con el conjunto de pedidos actualizado
    //3. Actualiza en la BD el producto con el conjunto de pedidos actualizado
//Parámetros:
    //bd: conexión a la BD
    //producto: producto al cual se le agregará el pedido
    //idPedido: id del pedido a agregar
//Devuelve:
    //constantesPedidos.PRODUCTO_SIN_ESPECIFICAR ||
    //constantesPedidos.PRODUCTO_ACTUALIZADO ||    
    //constantesPedidos.ERROR_ACTUALIZAR_PRODUCTO
const agregarPedidoAlProducto = async (bd, producto, idPedido) => {
    //1. Verifica que se tenga la conexión a la BD  
    if (!bd) { //se pudo establecer la conexión
        return constantesConexion.ERROR_CONEXION; 
    }

    //2. Actualiza en memoria el producto con el conjunto de pedidos actualizado
    let pedidosUpdate = [] ;
    try {
        if (producto) {  //se especificó un producto
            pedidosUpdate = [...producto.pedidos];
            pedidosUpdate.push(idPedido);
        }
        else {
            return constantesPedidos.PRODUCTO_SIN_ESPECIFICAR;
        }
    }
    catch(error) {
        return constantesPedidos.ERROR_LEER_PRODUCTOS;
    }

    //3. Actualiza en la BD el producto con el conjunto de pedidos actualizado
    try {
        await bd.collection('productos').updateOne({_id : producto._id}, {
            $set : {
                pedidos : pedidosUpdate
            }
        });
        return constantesPedidos.PRODUCTO_ACTUALIZADO;
    }
    catch(error) {
        return constantesPedidos.ERROR_ACTUALIZAR_PRODUCTO;
    }
}


//Verifica si existe un pedido con el cliente especificado
//Es un método auxiliar que lo llama borrarCliente() 
//Para hacer la verificación:
    //1. Verifica que se haya establecido la conexión a la BD
    //2. Realiza la verificación
//Parámetros:
    //cliente: conexión a la BD
    //idCliente: _id del cliente a buscar
//Devuelve: 
    //constantesConexion.ERROR_CONEXION || 
    //constantesPedidos.ERROR_LEER_PEDIDOS || 
    //constantesPedidos.PEDIDOS_CON_EL_CLIENTE ||
    //constantesPedidos.PEDIDOS_SIN_EL_CLIENTE
export const existenPedidosConEsteCliente = async (cliente, idCliente) => {  

    //1. Verifica que se haya establecido la conexión a la BD  
    if (!cliente) { //se pudo establecer la conexión
        return constantesConexion.ERROR_CONEXION; 
    }

    //2. Realiza la verificación
    const bd = cliente.db();

    let pedidosConEsteCliente;
    try {
        pedidosConEsteCliente = await bd.collection('pedidos').find({ "idCliente" : { $eq : idCliente} }).toArray();
    }
    catch(error) {
        return constantesPedidos.ERROR_LEER_PEDIDOS;
    }
    
    return pedidosConEsteCliente.length > 0 ? constantesPedidos.PEDIDOS_CON_EL_CLIENTE : constantesPedidos.PEDIDOS_SIN_EL_CLIENTE;             
}
    
//Verifica si existe un pedido con el cliente especificado
//Es un método auxiliar que lo llama borrarCliente() 
//Para hacer la verificación:
    //1. Verifica que se haya establecido la conexión a la BD
    //2. Realiza la verificación
//Parámetros:
    //cliente: conexión a la BD
    //idCliente: _id del cliente a buscar
//Devuelve: 
    //constantesConexion.ERROR_CONEXION || 
    //constantesPedidos.ERROR_LEER_PEDIDOS || 
    //constantesPedidos.PEDIDOS_CON_EL_PRODUCTO ||
    //constantesPedidos.PEDIDOS_SIN_EL_PRODUCTO
export const existenPedidosConEsteProducto = async (cliente, idProducto) => {  

    //1. Verifica que se haya establecido la conexión a la BD  
    if (!cliente) { //se pudo establecer la conexión
        return constantesConexion.ERROR_CONEXION; 
    }

    //2. Realiza la verificación
    const bd = cliente.db();

    let pedidosConEsteProducto;
    try {
        pedidosConEsteProducto = await bd.collection('pedidos').find({ "idProducto" : { $eq : idProducto} }).toArray();
    }
    catch(error) {
        return constantesPedidos.ERROR_LEER_PEDIDOS;
    }
    
    return pedidosConEsteProducto.length > 0 ? constantesPedidos.PEDIDOS_CON_EL_PRODUCTO : constantesPedidos.PEDIDOS_SIN_EL_PRODUCTO;             
}
    
    
//Dada una unidad, identificada por su _id, obtiene la equivalencia (proporción) de la unidad identificada por su idUnidadEquivalente
//Por ejemplo, dada la unidad "grs", obtiene la proporción de la unidad "Kg" (1 grs = 0.001 Kg)
//Si no se encuentra una equivalencia, devuelve null
//Es un método auxiliar llamado por actualizarIngredientes(), por eso no se lo exporta
//Como es un método auxiliar llamado por actualizarIngredientes():
    //ya está hecha la conexión a la BD
    //sí existe una equivalencia entre las 2 unidades (si no no se podría haber creado el producto)
    //Por esta razón no se hacen las verificaciones
//Parámetros:
    //bd: conexión a la BD
    //_id: id de la unidad a la cual se le busca una equivalencia (sería el id de grs)
    //idUnidadEquivalente: id de la unidad equivalente (sería el id de Kg)
//Devuelve:
    //Equivalencia (proporción) entre las unidades especificadas, o null si hubo algún error
const obtenerEquivalencia = async (bd, _id, idUnidadEquivalente) => {
    try {
        const unidades = await bd.collection('unidades').find({_id: {$eq: _id}}).toArray(); 
        const unidad = unidades[0];
        for(let i in unidad.equivalencias) {
            if (unidad.equivalencias[i]._id.equals(idUnidadEquivalente))
                return unidad.equivalencias[i].proporcion;
        }
    }
    catch(Error) {
        return null;
    }
}

//Dado un ingrediente, lo devuelve con su stock disminuido en la cantidad especificada
//Si al disminuir el stock el mismo queda <= 0, se lo pone en 0 (no existe stock negativo)
//Parámetros:
    //ingrediente: ingrediente a modificar su stock
    //cantidad: cantidad en la que se disminuye el stock
//Devuelve:
    //ingrediente actualizado    
const obtenerIngredienteActualizado = (ingrediente, cantidad) => {
    const ingredienteUpdate = {...ingrediente};
    ingredienteUpdate.stock -= cantidad;
    if (ingredienteUpdate.stock <= 0) 
        ingredienteUpdate.stock = 0;
    return ingredienteUpdate;
}


//Dado un pedido identificado por su _id,
//devuelve el objeto Pedido correspondiente, el cual se busca en el vector "pedidos"
//Si no se encuentra el _id, devuelve null
//Es un método auxiliar llamado por obtenerProductos()
//Parámetros:
	//_id: id del pedido
    //pedidos: vector de pedidos
//Devuelve:
    //objeto Pedido
export const obtenerPedido = (_id, pedidos) => {
    for(let i in pedidos) {
        if (pedidos[i]._id.equals(_id))
            return pedidos[i];
    }
    return null;
}


//Verifica que:
    //1. Se haya especificado un cliente, y que el mismo exista
    //2. La cantidad del producto sea > 0
    //3. Se haya especificado un producto, y que el mismo exista
//Parámetros:
    //idCliente: identificador del cliente
    //cantidad: cantidad del producto
    //idProducto: identificador del producto 
    //clientes: vector con todos los clientes
    //productos: vector con todos los productos
//Devuelve:
    //constantesPedidos.CLIENTE_SIN_ESPECIFICAR ||
    //constantesPedidos.CLIENTE_INEXISTENTE || 
    //constantesPedidos.CANTIDAD_INCORRECTA ||
    //constantesPedidos.PRODUCTO_SIN_ESPECIFICAR ||
    //constantesPedidos.PRODUCTO_INEXISTENTE || 
    //constantesPedidos.VERIFICACION_OK
const verificarPedido = (idCliente, cantidad, idProducto, clientes, productos) => {
    //Verifica que se haya especificado un cliente
    if (!idCliente) {
        return constantesPedidos.CLIENTE_SIN_ESPECIFICAR;
    } 

    //Verifica que el cliente especificado exista
    if (!obtenerCliente(idCliente, clientes)) {
        return constantesPedidos.CLIENTE_INEXISTENTE;
    }

    //Se verifica que la cantidad del producto sea > 0
    if (cantidad <= 0) {
        return constantesPedidos.CANTIDAD_INCORRECTA;
    }

    //Verifica que se haya especificado un cliente
    if (!idProducto) {
        return constantesPedidos.PRODUCTO_SIN_ESPECIFICAR;
    }   
    
    //Verifica que el cliente especificado exista
    if (!obtenerProducto(idProducto, productos)) {
        return constantesPedidos.PRODUCTO_INEXISTENTE;
    }

    return constantesPedidos.VERIFICACION_OK;
}



