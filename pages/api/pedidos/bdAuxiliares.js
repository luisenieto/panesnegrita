import { conectarBD } from "../unidades/bdAuxiliares";
import { constantes as constantesUnidades } from "../../../auxiliares/auxiliaresUnidades";
import { constantes as constantesPedidos } from "../../../auxiliares/auxiliaresPedidos";

//Dado el idPedido, devuelve el objeto pedido correspondiente
//Es un método auxiliar llamado por agregarPedido()
const obtenerPedidoRecienAgregado = async (bd, idPedido) => {
    const pedidosAgregados = await bd.collection('pedidos').find({_id: {$eq: idPedido}}).toArray(); 
    return pedidosAgregados[0];
}

//Dado un pedido, agrega al mismo al conjunto de pedidos del producto
//Es un método auxiliar llamado por agregarPedido()
const agregarPedidoAlProducto = async (bd, pedido) => {
    const todosLosProductos = await bd.collection('productos').find({_id: {$eq: pedido.idProducto}}).toArray(); 
    const productoDelPedido = todosLosProductos[0];
    let pedidosUpdate = [...productoDelPedido.pedidos];
    pedidosUpdate.push(pedido);

    await bd.collection('productos').updateOne({_id : productoDelPedido._id}, {
        $set : {
            foto: productoDelPedido.foto,
            nombre : productoDelPedido.nombre,
            precio : productoDelPedido.precio,
            ingredientes: productoDelPedido.ingredientes, 
            pedidos : pedidosUpdate
        }
    });
}

//Dado un pedido, agrega al mismo al conjunto de pedidos del cliente
//Es un método auxiliar llamado por agregarPedido()
const agregarPedidoAlCliente = async (bd, pedido) => {
    const todosLosClientes = await bd.collection('clientes').find({_id: {$eq: pedido.idCliente}}).toArray(); 
    const clienteDelPedido = todosLosClientes[0];
    let pedidosUpdate = [...clienteDelPedido.pedidos];
    pedidosUpdate.push(pedido);

    await bd.collection('clientes').updateOne({_id : clienteDelPedido._id}, {
        $set : {                    
            nombre : clienteDelPedido.nombre,
            apellido : clienteDelPedido.apellido,
            referencia : clienteDelPedido.referencia,
            telefono: clienteDelPedido.telefono, 
            correo: clienteDelPedido.correo, 
            fechaNacimiento: clienteDelPedido.fechaNacimiento, 
            pedidos : pedidosUpdate
        }
    });
}


//Agrega el pedido en la colección
//Luego de crear el pedido en la BD, lo agrega al conjunto de pedidos del producto y del cliente
//pedido: pedido a agregar
//mensaje : resultado de la operación (ERROR_CONEXION || ERROR_GUARDAR_PEDIDO || PEDIDO_CREADO
export const agregarPedido = async (pedido) => {    
    //Luego de hacer el agregado del pedido en la BD:
        //1. Se recupera de la BD el pedido recién agregado
        //2. Se agrega el pedido al conjunto de pedidos del producto
        //3. Se agrega el pedido al conjunto de pedidos del cliente
        //4. Se modifican las cantidades en stock de los distintos ingredientes del producto que forma el pedido

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();
        try {
            //Se crea el pedido en la BD (en el proceso se obtiene el _id)
            const resultadoInsertarPedido = await bd.collection('pedidos').insertOne(pedido);
            //cuando se está creando un pedido, no existe _id
            //una vez creado, se obtiene un _id, el cual se recupera en resultadoInsertarPedido.insertedId

            //1. Se recupera de la BD el pedido recién agregado
            const pedidoAgregado = await obtenerPedidoRecienAgregado(bd, resultadoInsertarPedido.insertedId);

            //2. Se agrega el pedido al conjunto de pedidos del producto
            await agregarPedidoAlProducto(bd, pedidoAgregado);

            //3. Se agrega el pedido al conjunto de pedidos del cliente
            await agregarPedidoAlCliente(bd, pedidoAgregado);

            //4. Se modifican las cantidades en stock de los distintos ingredientes del producto que forma el pedido
            //completar esta parte

            resultadoConectarBD.cliente.close();
            return constantesPedidos.PEDIDO_CREADO;
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return constantesPedidos.ERROR_GUARDAR_PEDIDO;
        }                
        //}
        //else {//ya existe un producto con ese nombre, o hubo algún error
        //    resultadoConectarBD.cliente.close();
        //    return resultadoExisteProducto;
        //}
    }
    else {
        return constantesUnidades.ERROR_CONEXION;
    }        
}
