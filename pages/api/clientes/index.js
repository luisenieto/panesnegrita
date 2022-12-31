import { constantes as constantesClientes} from "../../../auxiliares/auxiliaresClientes";
import { obtenerClientes, agregarCliente } from "./bdAuxiliares";

//api para el manejo de clientes
const handler = async (request, response) => {
    if (request.method === 'GET') {
        const resultadoObtenerClientes = await obtenerClientes();
        response.status(200).json({...resultadoObtenerClientes});
        return;
    }
    else if (request.method === 'POST') {
        const foto = request.body.foto;
        const nombre = request.body.nombre;
        const apellido = request.body.apellido;
        const referencia = request.body.referencia;
        const telefono = request.body.telefono;
        const correo = request.body.correo;
        const fechaNacimiento = request.body.fechaNacimiento ? new Date(request.body.fechaNacimiento) : null;
        const pedidos = request.body.pedidos;
        const operacion = request.body.operacion;

        //se verifica que el nombre del cliente no esté en blanco
        if (nombre === '') {
            response.status(200).json({mensaje : constantesClientes.NOMBRE_EN_BLANCO});
            return;
        }

        //se verifica que la referencia no esté en blanco
        if (referencia === '') {
            response.status(200).json({mensaje : constantesClientes.REFERENCIA_EN_BLANCO});
            return;
        }
       
        if (operacion === 'A') { //alta de cliente
            const resultadoAgregarCliente = await agregarCliente({foto, nombre, apellido, referencia, telefono, correo, fechaNacimiento, pedidos});
            response.status(200).json({mensaje : resultadoAgregarCliente});
        }
        else { //modificación de cliente
            const _id = new ObjectId(request.body._id);
            // //request.body._id es un string. Cuando se busca en la BD por _id, el mismo debe ser un ObjectId            
            const resultadoModificarCliente = await modificarCliente({_id, foto, nombre, apellido, referencia, telefono, correo, fechaNacimiento, pedidos});
            response.status(200).json({mensaje : resultadoModificarCliente});
        }        
    }
    else if (request.method === 'DELETE') { 
        // const ingrediente = request.body;        
        // const resultadoBorrarIngrediente = await borrarIngrediente(ingrediente);
        // response.status(200).json({mensaje : resultadoBorrarIngrediente});
    }
}

export default handler;