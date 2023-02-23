import { conectarBD } from "../unidades/bdAuxiliares";
import { constantes as constantesUnidades } from "../../../auxiliares/auxiliaresUnidades";
import { constantes as constantesClientes } from "../../../auxiliares/auxiliaresClientes";

//Obtiene todos los clientes
//Devuelve: objeto de la forma:
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || CLIENTES_LEIDOS_CORRECTAMENTE || ERROR_LEER_CLIENTES)
//    clientes : vector con los clientes leidos (si hubo error está vacío)
//}
export const obtenerClientes = async () => {     
    let resultadoObtenerClientes = {
        mensaje : '',
        clientes : []
    }

    //conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();
        try {
            let clientes = await bd.collection('clientes').find().toArray();
            resultadoObtenerClientes.mensaje = constantesClientes.CLIENTES_LEIDOS_CORRECTAMENTE;

            // const unidades = await bd.collection('unidades').find().toArray();
            // ingredientes = agregarNombreUnidades(ingredientes, unidades);
            // Falta completar para que se incluya toda la información de los pedidos
            resultadoObtenerClientes.clientes = clientes;
            resultadoConectarBD.cliente.close();            
            return resultadoObtenerClientes;
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return {...resultadoObtenerClientes, mensaje : constantesClientes.ERROR_LEER_CLIENTES};
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerClientes, mensaje : constantesUnidades.ERROR_CONEXION};
    }
    
}

//Verifica si existe un cliente con el nombre, apellido y referencia especificados
//Es un método auxiliar que lo llama agregarCliente() y modificarCliente() (por eso no se lo exporta)
//Se puede usar cuando se está creando un cliente (_id sin definir) o cuando se está modificando un cliente (_id definido)
//para eso hace una búsqueda insensible a mayúsculas/minúscuulas
//para lo cual crea índices en la colección 'clientes' que permiten hacer estas búsquedas
//El índice se crea sobre los atributos 'nombre', 'apellido' y 'referencia', en orden ascendente (1),
//utiliza el idioma español ('es') y es insensibles a mayúsculas/minúsculas (2)
//El índice se crean sólo en caso de no existir
//Una vez definido el índice, para que el mismo se use, se lo debe especificar tal cual al momento de hacer la búsqueda
//cliente: conexión a la BD
//nombre: nombre del cliente
//apellido: apellido del cliente
//referencia: referencia del cliente
//_id: sin definir cuando se está creando un cliente, definido cuando se está modificando un cliente
//Devuelve el resultado de la operación: ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_CLIENTES || CLIENTE_REPETIDO || CLIENTE_NO_REPETIDO
const existeCliente = async (cliente, nombre, apellido, referencia, _id) => {  
    if (cliente) { //se pudo establecer la conexión        
        const bd = cliente.db();
       
        //se crean los índices (si no existen)
        try {
            bd.collection('clientes').createIndex( 
                { 'nombre' : 1, 'apellido' : 1, 'referencia' : 1},
                { collation: 
                    {
                        locale : 'es',
                        strength : 2
                    }
                }
            );  
        }
        catch(error) {
            return constantesClientes.ERROR_CREAR_INDICE;
        }

        let clientesRepetidos;
        if (_id === undefined) { //creación de cliente
            try {
                clientesRepetidos = await bd.collection('clientes').find({ 
                    nombre : { $eq : nombre },
                    apellido : { $eq : apellido },
                    referencia : { $eq : referencia }
                }).collation( { locale: 'es', strength: 2 } ).toArray();
            }
            catch(error) {             
                return constantesClientes.ERROR_LEER_CLIENTES;
            }
        }
        else { //modificación de cliente
            try {                
                clientesRepetidos = await bd.collection('clientes').find({ 
                    nombre : { $eq : nombre }, 
                    apellido : { $eq : apellido },
                    referencia : { $eq : referencia }, 
                    _id : { $ne : _id}
                }).collation( { locale: 'es', strength: 2 } ).toArray();
            }
            catch(error) {
                return constantesClientes.ERROR_LEER_CLIENTES;
            }
        }
        return clientesRepetidos.length > 0 ? constantesClientes.CLIENTE_REPETIDO : constantesClientes.CLIENTE_NO_REPETIDO;
    }
    else { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION; 
    }
}



//Agrega el cliente en la colección
//cliente: cliente a agregar
//mensaje : resultado de la operación (ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_CLIENTES || CLIENTE_REPETIDO || CLIENTE_NO_REPETIDO || ERROR_GUARDAR_CLIENTE || CLIENTE_CREADO
export const agregarCliente = async (cliente) => {    
    //Para hacer el agregado:
        //1. Se verifica que no exista otro cliente con el mismo nombre, apellido y referencia (insensible a mayúsculas/minúsculas)
        //2. Se crea el cliente en la BD (en el proceso se obtiene el _id)

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        //1. Se verifica que no exista otro cliente con el mismo nombre y referencia (insensible a mayúsculas/minúsculas)
        const resultadoExisteCliente = await existeCliente(resultadoConectarBD.cliente, cliente.nombre, cliente.apellido, cliente.referencia);
        
        if (resultadoExisteCliente === constantesClientes.CLIENTE_NO_REPETIDO) { //no existe un cliente con ese nombre y esa referencia

            const bd = resultadoConectarBD.cliente.db();
            try {
                //2. Se crea el cliente en la BD (en el proceso se obtiene el _id)
                const resultadoInsertarCliente = await bd.collection('clientes').insertOne(cliente);
                //cuando se está creando un cliente, no existe _id
                //una vez creado, se obtiene un _id, el cual se recupera en resultadoInsertarCliente.insertedId

                resultadoConectarBD.cliente.close();
                return constantesClientes.CLIENTE_CREADO;
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return constantesClientes.ERROR_GUARDAR_CLIENTE;
            }                
        }
        else {//ya existe un cliente con ese nombre y referencia, o hubo algún error
            resultadoConectarBD.cliente.close();
            return resultadoExisteCliente;
        }
    }
    else {
        return constantesUnidades.ERROR_CONEXION;
    }        
}

//Obtiene el cliente con el _id especificado
//También devuelve la lista de clientes
//_id: _id a buscar
//Devuelve un objeto de la forma
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || CLIENTE_NULO || ERROR_LEER_CLIENTES || CLIENTES_LEIDOS_CORRECTAMENTE)
//    cliente : cliente con el _id especificado, o null si no se encuentra uno
//    clientes : lista de clientes (si hubo error está vacía)
//}
export const obtenerClienteParaModificar = async (_id) => {
    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    let resultadoObtenerCliente = {
        mensaje : '',
        cliente : null,
        clientes : []
    }

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        if (_id) { //se especificó un _id
            const bd = resultadoConectarBD.cliente.db();
            try {
                let clientes = await bd.collection('clientes').find({_id: {$eq: _id}}).toArray(); 
                let todosLosClientes = await bd.collection('clientes').find().toArray(); 
                resultadoConectarBD.cliente.close();
                return {
                    mensaje : constantesClientes.CLIENTES_LEIDOS_CORRECTAMENTE,
                    cliente : clientes.length === 1 ? clientes[0] : null,
                    clientes : todosLosClientes
                } 
                //si clientes.length === 1 es porque se encontró un único cliente
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return {...resultadoObtenerCliente, mensaje : constantesClientes.ERROR_LEER_CLIENTES};
            }
        }
        else { //no se especificó un _id
            resultadoConectarBD.cliente.close();
            return {...resultadoObtenerCliente, mensaje : constantesClientes.CLIENTE_NULO};
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerCliente, mensaje : constantesUnidades.ERROR_CONEXION};
    }
}

//Modifica el cliente en la colección
//cliente a modificar
//Devuelve el resultado de la operación: ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_CLIENTES || CLIENTE_REPETIDO || ERROR_ACTUALIZAR_CLIENTE || CLIENTE_MODIFICADO
export const modificarCliente = async (cliente) => {    
    //Para hacer la modificación:
        //1. Se verifica que no exista otro cliente con ese nombre, apellido y referencia (insensible a mayúsculas/minúsculas)
        //2. Se actualiza el cliente en la BD

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();

        //1. Se verifica que no exista otro cliente con ese nombre, apellido y referencia (insensible a mayúsculas/minúsculas)
        const resultadoExisteCliente = await existeCliente(resultadoConectarBD.cliente, cliente.nombre, cliente.apellido, cliente.referencia, cliente._id);
        if (resultadoExisteCliente === constantesClientes.CLIENTE_NO_REPETIDO) { //no existe un cliente con ese nombre, apellido y referencia
            try {                          
                //2. Se actualiza el ingrediente en la BD
                await bd.collection('clientes').updateOne({_id : cliente._id}, {
                    $set : {
                        nombre : cliente.nombre,
                        apellido : cliente.apellido,
                        referencia : cliente.referencia,
                        telefono : cliente.telefono,
                        correo : cliente.correo,
                        fechaNacimiento : cliente.fechaNacimiento,
                        pedidos : cliente.pedidos,
                    }
                }); 
                resultadoConectarBD.cliente.close();
                return constantesClientes.CLIENTE_MODIFICADO;
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return constantesClientes.ERROR_ACTUALIZAR_CLIENTE;
            }
        }
        else {//ya existe un cliente con ese nombre, apellido y referencia, o hubo algún error
            resultadoConectarBD.cliente.close();
            return resultadoExisteCliente;
        }
    }
    else { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION;
    }
}


// export const existeArchivo = () => {
//     const archivo = path.join(process.cwd(), 'public/avatars', 'avatar-predeterminado.png');
    
//     fs.access(archivo, fs.F_OK, (error) => {
//         if (error) {
//             //No existe el archivo
//             console.error(error);
//             return;
//         }
      
//         //Sí existe el archivo
//         console.log('Sí existe');
//     });

      
// }
