import { obtenerClientes, agregarCliente, borrarCliente, modificarCliente } from "./bdAuxiliares";
import { ObjectId } from 'mongodb';

//api para el manejo de clientes
const handler = async (request, response) => {
    if (request.method === 'GET') {
        const resultadoObtenerClientes = await obtenerClientes();
        response.status(200).json({...resultadoObtenerClientes});
        return;
    }
    else if (request.method === 'POST') {
        //const foto = request.body.foto;
        const nombre = request.body.nombre;
        const apellido = request.body.apellido;
        const referencia = request.body.referencia;
        const telefono = request.body.telefono;
        const correo = request.body.correo;
        const fechaNacimiento = request.body.fechaNacimiento ? new Date(request.body.fechaNacimiento) : null;
        const pedidos = request.body.pedidos;
        const operacion = request.body.operacion;
       
        if (operacion === 'A') { //alta de cliente
            const resultadoAgregarCliente = await agregarCliente({nombre, apellido, referencia, telefono, correo, fechaNacimiento, pedidos});
            response.status(200).json({mensaje : resultadoAgregarCliente});
        }
        else { //modificación de cliente
            const _id = new ObjectId(request.body._id);
            // request.body._id es un string. Cuando se busca en la BD por _id, el mismo debe ser un ObjectId            
            const resultadoModificarCliente = await modificarCliente({_id, nombre, apellido, referencia, telefono, correo, fechaNacimiento, pedidos});
            response.status(200).json({mensaje : resultadoModificarCliente});
        }        
    }
    else if (request.method === 'DELETE') { 
        const cliente = request.body;        
        const resultadoBorrarCliente = await borrarCliente(cliente);
        response.status(200).json({mensaje : resultadoBorrarCliente});
    }
}

export default handler;