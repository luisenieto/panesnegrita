import { conectarBD } from "../conexion/conexion";
import { constantes as constantesConexion } from "../../../auxiliares/auxiliaresConexion";
import { constantes as constantesPedidos } from "../../../auxiliares/auxiliaresPedidos";
import { obtenerCliente } from "../clientes/bdAuxiliares";
import { obtenerProducto } from "../productos/bdAuxiliares";
import { obtenerIngredienteEnStock } from "../ingredientes/bdAuxiliares";
import { ObjectId } from 'mongodb';




//*************************** Funciones de ABM y Listado ************************* */

//Agrega el pedido en la colección
//Para hacer el agregado:
    //1. Se conecta a la BD
    //2. Verifica que se haya especificado un cliente, y que el mismo exista, la cantidad del producto sea > 0, se haya especificado un producto, y que el mismo exista    
    //3. Crea el pedido en la BD (en el proceso se obtiene el _id)
    //4. Agrega el pedido al conjunto de pedidos del producto
    //5. Agrega el pedido al conjunto de pedidos del cliente
    //6. Actualiza (disminuye) en la BD las cantidades en stock de los distintos ingredientes
//Requiere de las funciones auxiliares:
    //(1) conectarBD()
    //(2) verificarPedido()
    //(4) agregarPedidoAlProducto()
    //(5) agregarPedidoAlCliente()
    //(6) actualizarIngredientes()
//Parámetros:
    //pedido: pedido a agregar
//Devuelve:    
    //constantesConexion.ERROR_CONEXION || 
    //constantesConexion.ERROR_LEER_CLIENTES_PRODUCTOS ||
    //constantesPedidos.ERROR_GUARDAR_PEDIDO ||
    //constantesPedidos.PRODUCTO_SIN_ESPECIFICAR ||
    //constantesPedidos.PRODUCTO_INEXISTENTE ||
    //constantesPedidos.CANTIDAD_INCORRECTA ||
    //constantesPedidos.IMPORTE_INCORRECTO || 
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

    //2. Verifica que se haya especificado un cliente, y que el mismo exista, la cantidad del producto sea > 0, se haya especificado un producto, y que el mismo exista, el importe del pedido sea > 0    
    const resultadoVerificacion = await verificarPedido(resultadoConectarBD.cliente, pedido.idCliente, pedido.cantidad, pedido.idProducto, pedido.importe);
    
    if (resultadoVerificacion.mensaje !== constantesPedidos.VERIFICACION_OK) 
        return resultadoVerificacion.mensaje;

    //3. Crea el pedido en la BD (en el proceso se obtiene el _id)        
    let resultadoInsertarPedido;
    try {
        resultadoInsertarPedido = await resultadoConectarBD.cliente.db().collection('pedidos').insertOne(pedido);
        //cuando se está creando un pedido, no existe _id
        //una vez creado, se obtiene un _id, el cual se recupera en resultadoInsertarPedido.insertedId
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return constantesPedidos.ERROR_GUARDAR_PEDIDO;
    }
    
    //4. Agrega el pedido al conjunto de pedidos del producto    
    const producto = resultadoVerificacion.producto;
    const resultadoAgregarPedidoAlProducto = await agregarPedidoAlProducto(resultadoConectarBD.cliente, producto, resultadoInsertarPedido.insertedId);

    if (resultadoAgregarPedidoAlProducto !== constantesPedidos.PRODUCTO_ACTUALIZADO) { //no se pudo agregar el pedido al conjunto de pedidos del producto
        resultadoConectarBD.cliente.close();
        return resultadoAgregarPedidoAlProducto;
    }
    
    //5. Agrega el pedido al conjunto de pedidos del cliente
    const cliente = resultadoVerificacion.cliente;
    const resultadoAgregarPedidoAlCliente = await agregarPedidoAlCliente(resultadoConectarBD.cliente, cliente, resultadoInsertarPedido.insertedId);

    if (resultadoAgregarPedidoAlCliente !== constantesPedidos.CLIENTE_ACTUALIZADO) {
        resultadoConectarBD.cliente.close();
        return resultadoAgregarPedidoAlCliente;
    }    
    
    //6. Actualiza en la BD las cantidades en stock de los distintos ingredientes
    const resultadoActualizarIngredientes = await actualizarIngredientes(resultadoConectarBD.cliente, producto, pedido.cantidad, 'disminuir');

    resultadoConectarBD.cliente.close();
    return resultadoActualizarIngredientes === constantesPedidos.INGREDIENTES_ACTUALIZADOS
        ?
            constantesPedidos.PEDIDO_CREADO
        :
            resultadoActualizarIngredientes
}


//Cancela el pedido (lo borra de la colección)
//Para hacer la cancelación:
    //1. Verifica que se haya especificado un pedido
    //2. Se conecta a la BD
    //3. Verifica que el pedido exista
    //4. Verifica que el estado del pedido sea constantesPedidos.ESTADO_PEDIDO
    //5. Obtiene el producto y cliente del pedido
    //6. Borra el pedido del conjunto de pedidos del producto
    //7. Borra el pedido del conjunto de pedidos del cliente    
    //8. Borra el pedido de la BD 
    //9. Actualiza (aumenta) en la BD las cantidades en stock de los distintos ingredientes        
//Requiere de las funciones auxiliares:
    //(2) conectarBD()
    //(5) borrarPedidoDelProducto()
    //(6) borrarPedidoDelCliente()
    //(8) actualizarIngredientes()
//Parámetros:
    //pedido: pedido a cancelar
//Devuelve:    
    //constantesPedidos.PEDIDO_SIN_ESPECIFICAR ||
    //constantesConexion.ERROR_CONEXION || 
    //constantesPedidos.ERROR_LEER_PEDIDOS || 
    //constantesPedidos.PEDIDO_INEXISTENTE ||
    //constantesPedidos.ERROR_CANCELAR_PEDIDO_POR_ESTADO ||
    //constantesPedidos.CLIENTE_SIN_ESPECIFICAR ||
    //constantesPedidos.ERROR_ACTUALIZAR_CLIENTE ||
    //constantesPedidos.PRODUCTO_SIN_ESPECIFICAR ||
    //constantesPedidos.ERROR_ACTUALIZAR_PRODUCTO ||    
    //constantesPedidos.ERROR_OBTENER_EQUIVALENCIA ||
    //constantesPedidos.ERROR_ACTUALIZAR_INGREDIENTES ||
    //constantesConexion.ERROR_LEER_CLIENTES_PRODUCTOS ||
    //constantesPedidos.ERROR_CANCELAR_PEDIDO ||    
    //constantesPedidos.PEDIDO_CANCELADO
export const cancelarPedido = async (pedido) => { 
    //1. Verifica que se haya especificado un pedido
    if (!pedido)
        return constantesPedidos.PEDIDO_SIN_ESPECIFICAR;

    //2. Se conecta a la BD    
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //3. Verifica que el pedido exista
    const resultadoExisteElPedido = await existeElPedido(resultadoConectarBD.cliente, new ObjectId(pedido._id));
    if (resultadoExisteElPedido !== constantesPedidos.PEDIDO_EXISTENTE)
        return resultadoExisteElPedido;

    //4. Verifica que el estado del pedido sea constantesPedidos.ESTADO_PEDIDO
    if (pedido.estado !== constantesPedidos.ESTADO_PEDIDO)
        return constantesPedidos.ERROR_CANCELAR_PEDIDO_POR_ESTADO;

    //5. Obtiene el producto y cliente del pedido
    //const bd = resultadoConectarBD.cliente.db();
    let productos; 
    let clientes;
    try {
        productos = await resultadoConectarBD.cliente.db().collection('productos').find({_id: {$eq: new ObjectId(pedido.idProducto)}}).toArray(); 
        clientes = await resultadoConectarBD.cliente.db().collection('clientes').find({_id: {$eq: new ObjectId(pedido.idCliente)}}).toArray(); 
    }
    catch(error) {
        return constantesPedidos.ERROR_LEER_CLIENTES_PRODUCTOS;
    }

    const producto = productos[0];
    const cliente = clientes[0];
    //Siempre se encontrarán un producto y un cliente ya que se verificó que existiera el pedido
        
    //6. Borra el pedido del conjunto de pedidos del producto    
    const resultadoBorrarPedidoDelProducto = await borrarPedidoDelProducto(resultadoConectarBD.cliente, producto, pedido._id);

    if (resultadoBorrarPedidoDelProducto !== constantesPedidos.PRODUCTO_ACTUALIZADO) { //no se pudo borrar el pedido del conjunto de pedidos del producto
        resultadoConectarBD.cliente.close();
        return resultadoBorrarPedidoDelProducto;
    }

    //7. Borra el pedido del conjunto de pedidos del cliente    
    const resultadoBorrarPedidoDelCliente = await borrarPedidoDelCliente(resultadoConectarBD.cliente, cliente, pedido._id);

    if (resultadoBorrarPedidoDelCliente !== constantesPedidos.CLIENTE_ACTUALIZADO) { //no se pudo borrar el pedido del conjunto de pedidos del cliente
        resultadoConectarBD.cliente.close();
        return resultadoBorrarPedidoDelCliente;
    } 
        
    //8. Borra el pedido de la BD
    try {  
        await resultadoConectarBD.cliente.db().collection('pedidos').deleteOne({ "_id" : new ObjectId(pedido._id) });
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return constantesPedidos.ERROR_CANCELAR_PEDIDO;
    }
    
    //9. Actualiza (aumenta) en la BD las cantidades en stock de los distintos ingredientes        
    const resultadoActualizarIngredientes = await actualizarIngredientes(resultadoConectarBD.cliente, producto, pedido.cantidad, 'aumentar');

    resultadoConectarBD.cliente.close();
    return resultadoActualizarIngredientes === constantesPedidos.INGREDIENTES_ACTUALIZADOS
        ?
            constantesPedidos.PEDIDO_CANCELADO
        :
            resultadoActualizarIngredientes
}



//Modifica el pedido en la colección (se puede modificar el cliente, producto, cantidad y/o importe)
//Como se le puede modificar el cliente y/o producto a un pedido, se debe tratar con los clientes y productos del pedido original y del pedido modificado
//No se puede modificar la fecha de un pedido
//Para la modificación sólo del estado está el método modificarEstadoPedido()
//Para hacer la modificación:
    //01. Verifica que se haya especificado un pedido
    //02. Se conecta a la BD  
    //03. Verifica que se haya especificado un cliente y que el mismo exista, la cantidad del producto sea > 0, se haya especificado un producto y que el mismo exista y que el importe del pedido sea > 0            
    //04. Verifica que el pedido exista en la BD (se recupera el pedido de la BD, con los datos originales)
    //05. Obtiene el producto y cliente del pedido (original)
    //06. Borra el pedido del conjunto de pedidos del producto (original)
    //07. Borra el pedido del conjunto de pedidos del cliente (original)
    //08. Actualiza (aumenta) en la BD las cantidades en stock de los distintos ingredientes (según el producto del pedido original)     
    //09. Modifica el pedido en la BD (el pedido original se actualiza con los nuevos valores)
    //10. Obtiene el producto y cliente del pedido (modificados)
    //11. Agrega el pedido (modificado) al conjunto de pedidos del producto (modificado)
    //12. Agrega el pedido (modificado) al conjunto de pedidos del cliente (modificado)
    //13. Actualiza en la BD las cantidades en stock de los distintos ingredientes (según el producto modificado)
//Requiere de las funciones auxiliares:
    //(02) conectarBD()
    //(03) verificarPedido()
    //(06) borrarPedidoDelProducto()
    //(07) borrarPedidoDelCliente()
    //(08) actualizarIngredientes()
    //(11) agregarPedidoAlProducto()
    //(12) agregarPedidoAlCliente()
    //(13) actualizarIngredientes()
//Parámetros:
    //pedido: pedido a modificar (ya tiene todos los datos modificados)
//Devuelve:    
    //constantesConexion.ERROR_CONEXION ||
    //constantesPedidos.PEDIDO_SIN_ESPECIFICAR ||
    //constantesPedidos.CLIENTE_SIN_ESPECIFICAR || 
    //constantesPedidos.PRODUCTO_SIN_ESPECIFICAR || 
    //constantesPedidos.ERROR_LEER_CLIENTES_PRODUCTOS || 
    //constantesPedidos.CLIENTE_INEXISTENTE || 
    //constantesPedidos.PRODUCTO_INEXISTENTE || 
    //constantesPedidos.CANTIDAD_INCORRECTA || 
    //constantesPedidos.IMPORTE_INCORRECTO || 
    //constantesPedidos.ERROR_LEER_PEDIDOS ||
    //constantesPedidos.PEDIDO_INEXISTENTE ||
    //constantesPedidos.ERROR_ACTUALIZAR_PRODUCTO ||
    //constantesPedidos.ERROR_ACTUALIZAR_CLIENTE ||
    //constantesPedidos.ERROR_ACTUALIZAR_INGREDIENTES ||
    //constantesPedidos.ERROR_ACTUALIZAR_PEDIDO ||
    //constantesPedidos.PEDIDO_MODIFICADO
export const modificarPedido = async (pedido) => {   
    //01. Verifica que se haya especificado un pedido
    if (!pedido)
        return constantesPedidos.PEDIDO_SIN_ESPECIFICAR;

    //02. Se conecta a la BD    
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //03. Verifica que se haya especificado un cliente, y que el mismo exista, la cantidad del producto sea > 0, se haya especificado un producto, y que el mismo exista, el importe del pedido sea > 0    
    const resultadoVerificacion = await verificarPedido(resultadoConectarBD.cliente, pedido.idCliente, pedido.cantidad, pedido.idProducto, pedido.importe);
    
    if (resultadoVerificacion.mensaje !== constantesPedidos.VERIFICACION_OK) {
        resultadoConectarBD.cliente.close();
        return resultadoVerificacion.mensaje;
    }

    //04. Verifica que el pedido exista en la BD (se recupera el pedido de la BD, con los datos originales)
    let pedidos; 
    try {
        pedidos = await resultadoConectarBD.cliente.db().collection('pedidos').find({ _id: { $eq: pedido._id } } ).toArray(); 
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return constantesPedidos.ERROR_LEER_PEDIDOS;
    }
    const pedidoOriginal = pedidos.length === 1 ? pedidos[0] : null;
    if (!pedidoOriginal) { //no existe el pedido
        resultadoConectarBD.cliente.close();
        return constantesPedidos.PEDIDO_INEXISTENTE;
    }

    //05. Obtiene el producto y cliente del pedido (original)
    let productos; 
    let clientes;
    try {
        productos = await resultadoConectarBD.cliente.db().collection('productos').find({ _id: { $eq: pedidoOriginal.idProducto } } ).toArray(); 
        clientes = await resultadoConectarBD.cliente.db().collection('clientes').find({ _id: { $eq: pedidoOriginal.idCliente } } ).toArray(); 
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return constantesPedidos.ERROR_LEER_CLIENTES_PRODUCTOS;
    }

    const productoOriginal = productos[0];
    const clienteOriginal = clientes[0];
    const cantidadOriginal = pedidoOriginal.cantidad;
    //Siempre se encontrarán un producto y un cliente ya que se verificó que existiera el pedido    

    //06. Borra el pedido del conjunto de pedidos del producto (original)
    const resultadoBorrarPedidoDelProducto = await borrarPedidoDelProducto(resultadoConectarBD.cliente, productoOriginal, pedido._id); //pedido._id === pedidoOriginal._id

    if (resultadoBorrarPedidoDelProducto !== constantesPedidos.PRODUCTO_ACTUALIZADO) { //no se pudo borrar el pedido del conjunto de pedidos del producto
        resultadoConectarBD.cliente.close();
        return resultadoBorrarPedidoDelProducto;
    }
 
    //07. Borra el pedido del conjunto de pedidos del cliente (original)
    const resultadoBorrarPedidoDelCliente = await borrarPedidoDelCliente(resultadoConectarBD.cliente, clienteOriginal, pedido._id); //pedido._id === pedidoOriginal._id

    if (resultadoBorrarPedidoDelCliente !== constantesPedidos.CLIENTE_ACTUALIZADO) { //no se pudo borrar el pedido del conjunto de pedidos del cliente
        resultadoConectarBD.cliente.close();
        return resultadoBorrarPedidoDelCliente;
    } 
    
    //08. Actualiza (aumenta) en la BD las cantidades en stock de los distintos ingredientes (según el producto del pedido original)
    let resultadoActualizarIngredientes = await actualizarIngredientes(resultadoConectarBD.cliente, productoOriginal, cantidadOriginal, 'aumentar');

    if (resultadoActualizarIngredientes !== constantesPedidos.INGREDIENTES_ACTUALIZADOS) {
        resultadoConectarBD.cliente.close();
        return resultadoActualizarIngredientes;
    }
    
    //09. Modifica el pedido en la BD (el pedido original se actualiza con los nuevos valores)
    try {             
        await resultadoConectarBD.cliente.db().collection('pedidos').updateOne({_id : pedido._id}, {
            $set : {
                idCliente: pedido.idCliente,
                idProducto : pedido.idProducto,
                cantidad : pedido.cantidad,
                importe: pedido.importe, 
                //fecha : pedido.fecha,
                //estado : pedido.estado,
            }
        }); 
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return constantesPedidos.ERROR_ACTUALIZAR_PEDIDO;
    }    

    //10. Obtiene el producto y cliente del pedido (modificados)
    try {
        productos = await resultadoConectarBD.cliente.db().collection('productos').find({ _id: { $eq: pedido.idProducto } } ).toArray(); 
        clientes = await resultadoConectarBD.cliente.db().collection('clientes').find({ _id: { $eq: pedido.idCliente } } ).toArray(); 
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return constantesPedidos.ERROR_LEER_CLIENTES_PRODUCTOS;
    }

    const productoModificado = productos[0];
    const clienteModificado = clientes[0];
    const cantidadModificada = pedido.cantidad;
        
    //11. Agrega el pedido (modificado) al conjunto de pedidos del producto (modificado)
    const resultadoAgregarPedidoAlProducto = await agregarPedidoAlProducto(resultadoConectarBD.cliente, productoModificado, pedido._id);

    if (resultadoAgregarPedidoAlProducto !== constantesPedidos.PRODUCTO_ACTUALIZADO) { //no se pudo agregar el pedido al conjunto de pedidos del producto
        resultadoConectarBD.cliente.close();
        return resultadoAgregarPedidoAlProducto;
    }            
    
    //12. Agrega el pedido (modificado) al conjunto de pedidos del cliente (modificado)    
    const resultadoAgregarPedidoAlCliente = await agregarPedidoAlCliente(resultadoConectarBD.cliente, clienteModificado, pedido._id);

    if (resultadoAgregarPedidoAlCliente !== constantesPedidos.CLIENTE_ACTUALIZADO) {
        resultadoConectarBD.cliente.close();
        return resultadoAgregarPedidoAlCliente;
    }
    
    //13. Actualiza en la BD las cantidades en stock de los distintos ingredientes (según el producto modificado)
    resultadoActualizarIngredientes = await actualizarIngredientes(resultadoConectarBD.cliente, productoModificado, cantidadModificada, 'disminuir');

    resultadoConectarBD.cliente.close();
    return resultadoActualizarIngredientes === constantesPedidos.INGREDIENTES_ACTUALIZADOS
        ?
            constantesPedidos.PEDIDO_MODIFICADO
        :
            resultadoActualizarIngredientes
}

export const modificarEstadoPedido = async (pedido) => {   
    //1. Verifica que se haya especificado un pedido
    if (!pedido)
        return constantesPedidos.PEDIDO_SIN_ESPECIFICAR;

    //2. Se conecta a la BD    
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //3. Verifica que el pedido exista en la BD
    const resultadoExisteElPedido = await existeElPedido(resultadoConectarBD.cliente, pedido._id);
    if (resultadoExisteElPedido !== constantesPedidos.PEDIDO_EXISTENTE)
        return resultadoExisteElPedido;

    //4. Modifica el estado del pedido en la BD
    const bd = resultadoConectarBD.cliente.db();
    try {
        await bd.collection('pedidos').updateOne({_id : pedido._id}, {
            $set : {
                estado : pedido.estado,
            }
        });     
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return constantesPedidos.ERROR_ACTUALIZAR_PEDIDO;
    }

    //5. Si el estado es "Entregado", lo saca del conjunto de pedidos del producto y del cliente
    if (pedido.estado === constantesPedidos.ESTADO_ENTREGADO) {
        let productos; 
        let clientes;
        try {
            productos = await bd.collection('productos').find({ _id: { $eq: pedido.idProducto } } ).toArray(); 
            clientes = await bd.collection('clientes').find({ _id: { $eq: pedido.idCliente } } ).toArray(); 
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return constantesPedidos.ERROR_LEER_CLIENTES_PRODUCTOS;
        }

        const productoDelPedido = productos[0];
        let index = productoDelPedido.pedidos.indexOf(pedido._id);
        productoDelPedido.pedidos.splice(index, 1);
        try {
            await bd.collection('productos').updateOne({_id : pedido.idProducto}, {
                $set : {
                    pedidos: productoDelPedido.pedidos,
                }
            });
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return constantesPedidos.ERROR_ACTUALIZAR_PRODUCTO;
        }

        const clienteDelPedido = clientes[0];
        index = clienteDelPedido.pedidos.indexOf(pedido._id);
        clienteDelPedido.pedidos.splice(index, 1);
        try {
            await bd.collection('clientes').updateOne({_id : pedido.idCliente}, {
                $set : {
                    pedidos: clienteDelPedido.pedidos,
                }
            });        
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return constantesPedidos.ERROR_ACTUALIZAR_CLIENTE;
        }
    }
    resultadoConectarBD.cliente.close();
    return constantesPedidos.PEDIDO_MODIFICADO;
}

//Obtiene el pedido con el _id especificado, o null si no encuentra uno
//También devuelve la lista de pedidos
//Todos los pedidos tienen un idProducto
//Para cada pedido, se agregan todos los datos del producto
//Para obtener el pedido:
    //1. Verifica que se haya especificado un _id
    //2. Si se especificó un _id, se conecta a la BD
    //3. Obtiene el pedido para el _id especificado
    //4. Se agregan todos los datos del producto
//Requiere de las funciones auxiliares:
    //(2) conectarBD()      
//Parámetros:    
    //_id: __id del pedido a buscar
//Devuelve:
    //{
    //    mensaje : constantesConexion.ERROR_CONEXION || constantesPedidos.PEDIDO_SIN_ESPECIFICAR || constantesPedidos.ERROR_LEER_PEDIDOS || constantesPedidos.PEDIDO_INEXISTENTE || constantesPedidos.ERROR_LEER_CLIENTES_PRODUCTOS || constantesPedidos.PEDIDOS_LEIDOS_CORRECTAMENTE)
    //    pedido : pedido con el _id especificado, o null si no se encuentra uno
    //    pedidos : lista de pedidos (si hubo error está vacía)
    //}
export const obtenerPedidoParaModificar = async (_id) => {        
    let resultadoObtenerPedido = {
        mensaje : '',
        pedido : null,
        pedidos : []
    }

    //1. Verifica que se haya especificado un _id
    if (!_id) { //no se especificó un _id            
        return {...resultadoObtenerPedido, mensaje : constantesPedidos.PEDIDO_SIN_ESPECIFICAR};        
    }

    //2. Si se especificó un _id, se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //3. Obtiene el pedido para el _id especificado
    const bd = resultadoConectarBD.cliente.db();
    let pedidos;
    let todosLosPedidos;
    try {
        pedidos = await bd.collection('pedidos').find({_id: {$eq: _id}}).toArray(); 
        todosLosPedidos = await bd.collection('pedidos').find().toArray();                 
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return {...resultadoObtenerPedido, mensaje : constantesPedidos.ERROR_LEER_PEDIDOS};
    }

    if (pedidos.length !== 1)
        return {
            mensaje : constantesPedidos.PEDIDO_INEXISTENTE,
            pedido : null,
            pedidos : []
        }

    //4. Agrega el apellido y nombre del cliente, y el nombre del producto
    const pedido = pedidos[0];
    //Ya se verificó que haya un pedido con el _id especificado

    let todosLosClientes;
    let todosLosProductos;
    let datosCliente;
    let datosProducto;
    try {
        todosLosClientes = await bd.collection('clientes').find().toArray();
        todosLosProductos = await bd.collection('productos').find().toArray();   
        datosCliente = obtenerCliente(pedido.idCliente, todosLosClientes);
        datosProducto = obtenerProducto(pedido.idProducto, todosLosProductos);
    }
    catch(error) {
        return {
            mensaje : constantesPedidos.ERROR_LEER_CLIENTES_PRODUCTOS,
            pedido : null,
            pedidos : []
        }
    }

    resultadoConectarBD.cliente.close();

    const pedidoUpdate = {
        ...pedido,
        producto : datosProducto,
        cliente : datosCliente
    }

    return {
        mensaje : constantesPedidos.PEDIDOS_LEIDOS_CORRECTAMENTE,
        pedido : pedidoUpdate,
        pedidos : todosLosPedidos
    } 
}


//*************************** Funciones auxiliares ************************* */

//Actualiza los ingredientes en la BD con los nuevos valores de stock
//Para actualizar los ingredientes:
    //1. Verifica que se haya establecido la conexión a la BD  
    //2. Verifica que se haya especificado un producto
    //3. Obtiene los ingredientes del producto del pedido
    //4. Se actualizan los ingredientes del producto del pedido (siempre que los ingredientes sean ingredientes, y no productos):
        //Si la unidad del ingrediente del producto del pedido es la misma que la del ingrediente en stock
    	//hay que aumentar o disminuir de la cantidad en stock la cantidad del ingrediente
		//Por ejemplo, tomar el ingrediente "Manteca", cuya unidad sea "grs", y que en stock hubiera 500 grs
        //Si un producto lleva 100 grs de manteca, cuando se haga un pedido se debe disminuir en 100 grs el stock
        //Si un producto lleva 100 grs de manteca, cuando se cancela un pedido se debe aumentar en 100 grs el stock

        //Si la unidad del ingrediente del producto del pedido no es la misma que la del ingrediente en stock hay que buscar la equivalencia
        //Por ejemplo, tomar el ingrediente "Manteca", cuya unidad sea "Kg", y que en stock hubiera 1 Kg
        //Si un producto lleva 100 "grs" de manteca, hay que buscar la equivalencia entre "Kg" y "grs" (1 "grs" = X "Kg": 0.001 para este ejemplo)
        //Luego, al producto habrá que aumentarle/disminuirle el stock en: equivalencia * cantidad del ingrediente (0.001 * 100 = 0.1)
        //Por lo que el stock quedará en 1 +/- 0.1 = 1.1/0.9 Kg        
//Requiere de las funciones auxiliares:
    //(4) obtenerIngredienteEnStock()
    //(4) obtenerIngredienteActualizado()
    //(4) obtenerEquivalencia()
//Parámetros:
    //bd: conexión a la BD
    //producto: producto cuyos ingredientes se actualizarán en stock
    //cantidad: cantidad del producto que forma el pedido
    //operacion: 'aumentar' | 'disminuir'
//Devuelve:
    //constantesConexion.ERROR_CONEXION ||
    //constantesPedidos.PRODUCTO_SIN_ESPECIFICAR ||
    //constantesPedidos.ERROR_OBTENER_EQUIVALENCIA ||
    //constantesPedidos.INGREDIENTES_ACTUALIZADOS ||
    //constantesPedidos.ERROR_ACTUALIZAR_INGREDIENTES
const actualizarIngredientes = async (cliente, producto, cantidad, operacion) => {

    //1. Verifica que se haya establecido la conexión a la BD  
    if (!cliente)  //no se pudo establecer la conexión
        return constantesConexion.ERROR_CONEXION; 

    //2. Verifica que se haya especificado un producto
    if (!producto) //no se especificó un producto
        return constantesPedidos.PRODUCTO_SIN_ESPECIFICAR;

    //3. Obtiene los ingredientes del producto del pedido
    const ingredientes = producto.ingredientes; 

    //4. Se actualizan los ingredientes del producto del pedido (siempre que los ingredientes sean ingredientes, y no productos):
    let ingredientesAModificar = [];
    for(let i in ingredientes) {
        const idIngredienteDelProductoDelPedido = ingredientes[i].idIngrediente;
        const cantidadIngredienteDelProductoDelPedido = ingredientes[i].cantidad;
        const idUnidadIngredienteDelProductoDelPedido = ingredientes[i].idUnidad;

        //Se obtiene el ingrediente en stock
	    //No se usa el método obtenerIngredienteParaModificar() porque este abre y cierra la conexión
        const ingredienteEnStock = await obtenerIngredienteEnStock(cliente, idIngredienteDelProductoDelPedido);
        
        if (!ingredienteEnStock)  //no se trata de un ingrediente, sino de un producto
            break;

        const idUnidadIngredienteEnStock = ingredienteEnStock.idUnidad; //es la unidad del ingrediente en stock

        if (idUnidadIngredienteDelProductoDelPedido.equals(idUnidadIngredienteEnStock)) //unidades iguales            
            ingredientesAModificar.push(obtenerIngredienteActualizado(ingredienteEnStock, cantidadIngredienteDelProductoDelPedido * cantidad, operacion));
        else { //unidades distintas            
            const equivalencia = await obtenerEquivalencia(cliente, idUnidadIngredienteDelProductoDelPedido, idUnidadIngredienteEnStock);
            if (equivalencia)            
                ingredientesAModificar.push(obtenerIngredienteActualizado(ingredienteEnStock, equivalencia * cantidadIngredienteDelProductoDelPedido * cantidad, operacion));                            
            else
                return constantesPedidos.ERROR_OBTENER_EQUIVALENCIA;                
        }
    }
    
    try {
        for(let i in ingredientesAModificar) {
            const ingrediente = ingredientesAModificar[i];
            await cliente.db().collection('ingredientes').updateOne({_id : ingrediente._id}, {
                $set : {                
                    stock : ingrediente.stock                
                }
            });
        }    
        return constantesPedidos.INGREDIENTES_ACTUALIZADOS;
    }
    catch(error) {
        return constantesPedidos.ERROR_ACTUALIZAR_INGREDIENTES;
    }
}




//Dado un pedido, agrega al mismo al conjunto de pedidos del cliente
//Es un método auxiliar llamado por agregarPedido()
//Para agregar el pedido:
    //1. Verifica que se haya establecido la conexión a la BD  
    //2. Verifica que se haya especificado un cliente
    //3. Actualiza el conjunto de pedidos
    //4. Actualiza en la BD el cliente con el conjunto de pedidos actualizado
//Parámetros:
    //clienteBD: conexión a la BD
    //cliente: cliente al cual se le agregará el pedido
    //idPedido: id del pedido a agregar
//Devuelve:
    //constantesConexion.ERROR_CONEXION ||
    //constantesPedidos.CLIENTE_SIN_ESPECIFICAR ||
    //constantesPedidos.CLIENTE_ACTUALIZADO ||    
    //constantesPedidos.ERROR_ACTUALIZAR_CLIENTE
const agregarPedidoAlCliente = async (clienteBD, cliente, idPedido) => {
    //1. Verifica que se tenga la conexión a la BD  
    if (!clienteBD) { //no se pudo establecer la conexión
        return constantesConexion.ERROR_CONEXION; 
    }

    //2. Verifica que se haya especificado un cliente
    if (!cliente)
        return constantesPedidos.CLIENTE_SIN_ESPECIFICAR;

    //3. Actualiza el conjunto de pedidos
    let pedidosUpdate = [...cliente.pedidos];    
    pedidosUpdate.push(idPedido);
    
    //4. Actualiza en la BD el cliente con el conjunto de pedidos actualizado
    try {
        await clienteBD.db().collection('clientes').updateOne({_id : cliente._id}, {
            $set : {                    
                pedidos : pedidosUpdate
            }
        });
        return constantesPedidos.CLIENTE_ACTUALIZADO;
    }
    catch(error) {
        return constantesPedidos.ERROR_ACTUALIZAR_CLIENTE;
    }
}


//Dado un pedido, lo borra del conjunto de pedidos del cliente
//Es un método auxiliar llamado por cancelarPedido()
//Para borrar el pedido:
    //1. Verifica que se haya establecido la conexión a la BD  
    //2. Verifica que se haya especificado un cliente
    //3. Actualiza el conjunto de pedidos
    //4. Actualiza en la BD el cliente con el conjunto de pedidos actualizado
//Parámetros:
    //clienteBD: conexión a la BD
    //cliente: producto al cual se le borrará el pedido
    //idPedido: id del pedido a borrar
//Devuelve:
    //constantesConexion.ERROR_CONEXION ||
    //constantesPedidos.CLIENTE_SIN_ESPECIFICAR ||
    //constantesPedidos.CLIENTE_ACTUALIZADO ||    
    //constantesPedidos.ERROR_ACTUALIZAR_CLIENTE
const borrarPedidoDelCliente = async (clienteBD, cliente, idPedido) => {
    //1. Verifica que se tenga la conexión a la BD  
    if (!clienteBD) { //no se pudo establecer la conexión
        return constantesConexion.ERROR_CONEXION; 
    }

    //2. Verifica que se haya especificado un cliente
    if (!cliente)
        return constantesPedidos.CLIENTE_SIN_ESPECIFICAR;

    //3. Actualiza el conjunto de pedidos
    let pedidosUpdate = [...cliente.pedidos];
    const index = pedidosUpdate.indexOf(idPedido);
    pedidosUpdate.splice(index, 1);    

    //4. Actualiza en la BD el cliente con el conjunto de pedidos actualizado
    try {
        await clienteBD.db().collection('clientes').updateOne({_id : cliente._id}, {
            $set : {
                pedidos : pedidosUpdate
            }
        });
        return constantesPedidos.CLIENTE_ACTUALIZADO;
    }
    catch(error) {
        return constantesPedidos.ERROR_ACTUALIZAR_CLIENTE;
    }
}
    

//Dado un pedido, agrega al mismo al conjunto de pedidos del producto
//Es un método auxiliar llamado por agregarPedido()
//Para agregar el pedido:
    //1. Verifica que se haya establecido la conexión a la BD  
    //2. Verifica que se haya especificado un producto
    //3. Actualiza el conjunto de pedidos
    //4. Actualiza en la BD el producto con el conjunto de pedidos actualizado
//Parámetros:
    //cliente: conexión a la BD    
    //producto: producto al cual se le agregará el pedido
    //idPedido: id del pedido a agregar
//Devuelve:
    //constantesConexion.ERROR_CONEXION ||
    //constantesPedidos.PRODUCTO_SIN_ESPECIFICAR ||
    //constantesPedidos.PRODUCTO_ACTUALIZADO ||    
    //constantesPedidos.ERROR_ACTUALIZAR_PRODUCTO
const agregarPedidoAlProducto = async (cliente, producto, idPedido) => {
    //1. Verifica que se tenga la conexión a la BD  
    if (!cliente) { //no se pudo establecer la conexión
        return constantesConexion.ERROR_CONEXION; 
    }

    //2. Verifica que se haya especificado un producto
    if (!producto)
        return constantesPedidos.PRODUCTO_SIN_ESPECIFICAR;

    //3. Actualiza el conjunto de pedidos
    let pedidosUpdate = [...producto.pedidos];
    pedidosUpdate.push(idPedido);
            
    //4. Actualiza en la BD el producto con el conjunto de pedidos actualizado
    try {
        await cliente.db().collection('productos').updateOne({_id : producto._id}, {
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


//Dado un pedido, lo borra del conjunto de pedidos del producto
//Es un método auxiliar llamado por cancelarPedido()
//Para borrar el pedido:
    //1. Verifica que se haya establecido la conexión a la BD  
    //2. Verifica que se haya especificado un producto
    //3. Actualiza el conjunto de pedidos
    //4. Actualiza en la BD el producto con el conjunto de pedidos actualizado
//Parámetros:
    //cliente: conexión a la BD
    //producto: producto al cual se le borrará el pedido
    //idPedido: id del pedido a borrar
//Devuelve:
    //constantesConexion.ERROR_CONEXION ||
    //constantesPedidos.PRODUCTO_SIN_ESPECIFICAR ||
    //constantesPedidos.PRODUCTO_ACTUALIZADO ||    
    //constantesPedidos.ERROR_ACTUALIZAR_PRODUCTO
const borrarPedidoDelProducto = async (cliente, producto, idPedido) => {
    //1. Verifica que se tenga la conexión a la BD  
    if (!cliente) { //no se pudo establecer la conexión
        return constantesConexion.ERROR_CONEXION; 
    }

    //2. Verifica que se haya especificado un producto
    if (!producto)
        return constantesPedidos.PRODUCTO_SIN_ESPECIFICAR;

    //3. Actualiza el conjunto de pedidos
    let pedidosUpdate = [...producto.pedidos];
    const index = pedidosUpdate.indexOf(idPedido);
    pedidosUpdate.splice(index, 1);    

    //4. Actualiza en la BD el producto con el conjunto de pedidos actualizado
    try {
        await cliente.db().collection('productos').updateOne({_id : producto._id}, {
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

//Verifica si existe algún pedido con el idPedido especificado
//Es un método auxiliar que lo llama cancelarPedido(), por eso no se lo exporta
//Para hacer la verificación:
    //1. Verifica que se haya establecido la conexión a la BD
    //2. Verifica la existencia del pedido en la BD
//Parámetros:
    //cliente: conexión a la BD
    //idPedido: _id del pedido a buscar
//Devuelve: 
    //constantesConexion.ERROR_CONEXION || 
    //constantesPedidos.ERROR_LEER_PEDIDOS || 
    //constantesPedidos.PEDIDO_INEXISTENTE ||
    //constantesPedidos.PEDIDO_EXISTENTE
export const existeElPedido = async (cliente, idPedido) => {
    //1. Verifica que se haya establecido la conexión a la BD
    if (!cliente) { //no se pudo establecer la conexión        
        return constantesConexion.ERROR_CONEXION;
    }

    //2. Verifica la existencia del pedido en la BD
    let pedidos;
    try {
        pedidos = await cliente.db().collection('pedidos').find({ _id : { $eq : idPedido }}).toArray();
    }
    catch(error) {             
        return constantesPedidos.ERROR_LEER_PEDIDOS;
    }
    
    return pedidos.length > 0 ? constantesPedidos.PEDIDO_EXISTENTE : constantesPedidos.PEDIDO_INEXISTENTE;
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
    //cliente: conexión a la BD
    //_id: id de la unidad a la cual se le busca una equivalencia (sería el id de grs)
    //idUnidadEquivalente: id de la unidad equivalente (sería el id de Kg)
//Devuelve:
    //Equivalencia (proporción) entre las unidades especificadas, o null si hubo algún error
const obtenerEquivalencia = async (cliente, _id, idUnidadEquivalente) => {
    try {
        const unidades = await cliente.db().collection('unidades').find({_id: {$eq: _id}}).toArray(); 
        const unidad = unidades[0];
        for(let i in unidad.equivalencias) {
            if (unidad.equivalencias[i]._id.equals(idUnidadEquivalente))
                return unidad.equivalencias[i].proporcion;
        }
    }
    catch(error) {
        return null;
    }
}

//Dado un ingrediente, lo devuelve con su stock aumentado o disminuido en la cantidad especificada
//Este método se usa cuando se crea un nuevo pedido (en cuyo caso se debe disminuir la cantidad en stock del ingrediente)
//o cuando se cancela un pedido (en cuyo caso se debe aumentar la cantidad en stock del ingrediente)
//Si al disminuir el stock el mismo queda <= 0, se lo pone en 0 (no existe stock negativo)
//Parámetros:
    //ingrediente: ingrediente a modificar su stock
    //cantidad: cantidad en la que se disminuye el stock
    //operacion: 'aumentar' | 'disminuir'
//Devuelve:
    //ingrediente actualizado    
const obtenerIngredienteActualizado = (ingrediente, cantidad, operacion) => {
    const ingredienteUpdate = {...ingrediente};
    ingredienteUpdate.stock = operacion === 'aumentar' ? ingredienteUpdate.stock + cantidad : ingredienteUpdate.stock - cantidad;
    //ingredienteUpdate.stock -= cantidad;
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
    //cliente: conexión a la BD
    //idCliente: identificador del cliente
    //cantidad: cantidad del producto
    //idProducto: identificador del producto 
    //clientes: vector con todos los clientes
    //productos: vector con todos los productos
//Devuelve:
    //{
        //mensaje: constantesConexion.ERROR_CONEXION || constantesPedidos.CLIENTE_SIN_ESPECIFICAR || constantesPedidos.CLIENTE_INEXISTENTE || constantesPedidos.CANTIDAD_INCORRECTA || constantesPedidos.IMPORTE_INCORRECTO || constantesPedidos.PRODUCTO_SIN_ESPECIFICAR || constantesPedidos.PRODUCTO_INEXISTENTE || constantesPedidos.ERROR_LEER_CLIENTES_PRODUCTOS || constantesPedidos.VERIFICACION_OK
        //cliente: cliente (si existe) del pedido
        //producto: producto (si existe) del pedido
    //}
const verificarPedido = async (cliente, idCliente, cantidad, idProducto, importe) => {
    let resultadoVerificarPedido = {
        mensaje : '',
        cliente : null,
        producto : null
    }

    if (!cliente)
        return { ...resultadoVerificarPedido, mensaje : constantesConexion.ERROR_CONEXION };
    
    if (!idCliente) //no se especificó un cliente
        return { ...resultadoVerificarPedido, mensaje : constantesPedidos.CLIENTE_SIN_ESPECIFICAR };
    
    if (!idProducto) //no se especificó un producto
        return { ...resultadoVerificarPedido, mensaje: constantesPedidos.PRODUCTO_SIN_ESPECIFICAR };

    let productos;     
    let clientes;
    const bd = cliente.db();
    try {
        productos = await bd.collection('productos').find({_id: {$eq: idProducto}}).toArray(); 
        clientes = await bd.collection('clientes').find({_id: {$eq: idCliente}}).toArray(); 
    }
    catch(error) {
        return { ...resultadoVerificarPedido, mensaje : constantesPedidos.ERROR_LEER_CLIENTES_PRODUCTOS };
    }
    
    if (!obtenerCliente(idCliente, clientes)) //el cliente especificado no existe
        return { ...resultadoVerificarPedido, mensaje : constantesPedidos.CLIENTE_INEXISTENTE };
    
    if (!obtenerProducto(idProducto, productos)) //el producto especificado no existe
        return { ...resultadoVerificarPedido, mensaje : constantesPedidos.PRODUCTO_INEXISTENTE };
    
    if (cantidad <= 0) //la cantidad del producto es negativa o 0
        return { ...resultadoVerificarPedido, mensaje : constantesPedidos.CANTIDAD_INCORRECTA };

    if (importe <= 0) //el importe del pedido es negativo o 0
        return { ...resultadoVerificarPedido, mensaje : constantesPedidos.IMPORTE_INCORRECTO };        

    return {
        mensaje : constantesPedidos.VERIFICACION_OK,
        cliente : clientes[0],
        producto : productos[0]
        //como ya se verificó que el pedido, siempre se encontrará un producto y un cliente
    }
}



