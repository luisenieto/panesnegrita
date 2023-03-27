import { ObjectId } from 'mongodb';
import { agregarPedido, modificarPedido } from './bdAuxiliares';

//api para el manejo de pedidos
const handler = async (request, response) => {
    if (request.method === 'GET') {
        /* const resultadoObtenerProductos = await obtenerProductos();
        response.status(200).json({...resultadoObtenerProductos});
        return; */
    }
    else if (request.method === 'POST') {
        const idCliente = new ObjectId(request.body.idCliente);
        const idProducto = new ObjectId(request.body.idProducto);
        const cantidad = request.body.cantidad;
        const importe = request.body.importe;
        const fecha = request.body.fecha;
        const estado = request.body.estado;
        const operacion = request.body.operacion;               
       
        if (operacion === 'A') { //alta de pedido
            const resultadoAgregarPedido = await agregarPedido({idCliente, idProducto, cantidad, importe, fecha, estado});
            response.status(200).json({mensaje : resultadoAgregarPedido});
        }
        else { //modificación de pedido
            const _id = new ObjectId(request.body._id);
            // request.body._id es un string. Cuando se busca en la BD por _id, el mismo debe ser un ObjectId            
            const resultadoModificarPedido = await modificarPedido({_id, idCliente, idProducto, cantidad, importe, fecha, estado});
            response.status(200).json({mensaje : resultadoModificarPedido});
        }        
    }
    else if (request.method === 'DELETE') { 
        // const ingrediente = request.body;        
        // const resultadoBorrarIngrediente = await borrarIngrediente(ingrediente);
        // response.status(200).json({mensaje : resultadoBorrarIngrediente});
    }
}

export default handler;