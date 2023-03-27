import { obtenerProductos, agregarProducto, modificarProducto } from "./bdAuxiliares";
import { ObjectId } from 'mongodb';
import { borrarProducto } from "./bdAuxiliares";

//api para el manejo de productos
const handler = async (request, response) => {
    if (request.method === 'GET') {
        const resultadoObtenerProductos = await obtenerProductos();
        response.status(200).json({...resultadoObtenerProductos});
        return;
    }
    else if (request.method === 'POST') {
        const foto = request.body.foto;
        const nombre = request.body.nombre;
        const precio = request.body.precio;
        const ingredientes = request.body.ingredientes;
        const pedidos = request.body.pedidos;
        const operacion = request.body.operacion;
       
        if (operacion === 'A') { //alta de producto
            const resultadoAgregarProducto = await agregarProducto({foto, nombre, precio, ingredientes, pedidos});
            response.status(200).json({mensaje : resultadoAgregarProducto});
        }
        else { //modificación de producto
            const _id = new ObjectId(request.body._id);
            // request.body._id es un string. Cuando se busca en la BD por _id, el mismo debe ser un ObjectId            
            const resultadoModificarProducto = await modificarProducto({_id, foto, nombre, precio, ingredientes, pedidos});
            response.status(200).json({mensaje : resultadoModificarProducto});
        }        
    }
    else if (request.method === 'DELETE') { 
        const producto = request.body;        
        const resultadoBorrarProducto = await borrarProducto(producto);
        response.status(200).json({mensaje : resultadoBorrarProducto});
    }
}

export default handler;