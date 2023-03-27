import { conectarBD } from "../conexion/conexion"; 
import { constantes as constantesConexion } from "../../../auxiliares/auxiliaresConexion";
import { constantes as constantesClientes } from "../../../auxiliares/auxiliaresClientes";
import { constantes as constantesPedidos } from "../../../auxiliares/auxiliaresPedidos";
import { existenPedidosConEsteCliente } from "../pedidos/bdAuxiliares";
import { ObjectId } from 'mongodb';

//*************************** Funciones de ABM y Listado ************************* */

//Agrega el cliente en la colección
//Para hacer el agregado:
    //1. Verifica que el apellido, nombre y referencia no sean nulos
    //2. Se conecta a la BD
    //3. Verifica que no exista otro cliente con el mismo nombre, apellido y referencia (insensible a mayúsculas/minúsculas)
    //4. Crea el cliente en la BD (en el proceso se obtiene el _id)
//Requiere de las funciones auxiliares:
    //(1) verificarCliente()
    //(2) conectarBD()
    //(3) existeCliente()
//Parámetros:    
//cliente: cliente a agregar
//Devuelve:
    //constantesClientes.APELLIDO_EN_BLANCO ||
    //constantesClientes.NOMBRE_EN_BLANCO||
    //constantesClientes.REFERENCIA_EN_BLANCO ||
    //constantesConexion.ERROR_CONEXION || 
    //constantesClientes.ERROR_CREAR_INDICE ||
    //constantesClientes.CLIENTE_REPETIDO ||
    //constantesClientes.ERROR_GUARDAR_CLIENTE ||
    //constantesClientes.CLIENTE_CREADO ||
    //constantesClientes.ERROR_LEER_CLIENTES
export const agregarCliente = async (cliente) => {    
    //1. Verifica que el apellido, nombre y referencia no sean nulos
    const resultadoVerificacion = verificarCliente(cliente.apellido, cliente.nombre, cliente.referencia);

    if (resultadoVerificacion !== constantesClientes.VERIFICACION_OK) 
        return resultadoVerificacion;

    //2. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //3. Verifica que no exista otro cliente con el mismo nombre, apellido y referencia (insensible a mayúsculas/minúsculas)            
    const resultadoExisteCliente = await existeCliente(resultadoConectarBD.cliente, cliente.apellido, cliente.nombre, cliente.referencia);

    if (resultadoExisteCliente !== constantesClientes.CLIENTE_NO_REPETIDO) { //ya existe un cliente con ese nombre y esa referencia
        resultadoConectarBD.cliente.close();
        return resultadoExisteCliente;
    }        

    //4. Crea el cliente en la BD (en el proceso se obtiene el _id)
    const bd = resultadoConectarBD.cliente.db();
    try {
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

//Borra el cliente especificado
//Para hacer el borrado:
    //1. Se conecta a la BD
    //2. Verifica que no haya pedidos con el mismo
    //3. Borra de la BD el cliente
//Requiere de las funciones auxiliares:
    //(1) conectarBD()
    //(2) existePedidoConEsteCliente()
//Parámetros:
    //cliente: cliente a borrar
//Devuelve:
    //constantesConexion.ERROR_CONEXION || 
    //constantesPedidos.ERROR_LEER_PEDIDOS || 
    //constantesPedidos.PEDIDOS_CON_EL_CLIENTE ||
    //constantesClientes.ERROR_BORRAR_CLIENTE || 
    //constantesClientes.CLIENTE_BORRADO
export const borrarCliente = async (cliente) => {

    //1. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //2. Verifica que no haya pedidos con el mismo
    const bd = resultadoConectarBD.cliente.db();

    const hayPedidosConEsteCliente = await existenPedidosConEsteCliente(resultadoConectarBD.cliente, new ObjectId(cliente._id));
    if (hayPedidosConEsteCliente === constantesPedidos.PEDIDOS_CON_EL_CLIENTE) {
        resultadoConectarBD.cliente.close();
        return hayPedidosConEsteCliente;
    }
    
    //3. Borra de la BD el cliente
        
    try {  
        await bd.collection('clientes').deleteOne({ "_id" : new ObjectId(cliente._id) });
        resultadoConectarBD.cliente.close();
        return constantesClientes.CLIENTE_BORRADO;
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return constantesClientes.ERROR_BORRAR_CLIENTE;
    }       
}


//Modifica el cliente en la colección
//Para hacer la modificación:
    //1. Verifica que el apellido, nombre y referencia no sean nulos
    //2. Se conecta a la BD
    //3. Verifica que no exista otro cliente con ese nombre, apellido y referencia (insensible a mayúsculas/minúsculas)
    //4. Se actualiza el cliente en la BD
//Requiere de las funciones auxiliares:
    //(1) verificarCliente()
    //(2) conectarBD()
    //(3) existeCliente() 
//Parámetros:       
    //cliente a modificar
//Devuelve:
    //constantesClientes.APELLIDO_EN_BLANCO ||
    //constantesClientes.NOMBRE_EN_BLANCO||
    //constantesClientes.REFERENCIA_EN_BLANCO ||
    //constantesConexion.ERROR_CONEXION || 
    //constantesClientes.ERROR_CREAR_INDICE ||
    //constantesClientes.CLIENTE_REPETIDO ||
    //constantesClientes.ERROR_ACTUALIZAR_CLIENTE ||
    //constantesClientes.CLIENTE_MODIFICADO ||
    //constantesClientes.ERROR_LEER_CLIENTES
export const modificarCliente = async (cliente) => {    
    //1. Verifica que el apellido, nombre y referencia no sean nulos
    const resultadoVerificacion = verificarCliente(cliente.apellido, cliente.nombre, cliente.referencia);

    if (resultadoVerificacion !== constantesClientes.VERIFICACION_OK) 
        return resultadoVerificacion;

    //2. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //3. Verifica que no exista otro cliente con ese nombre, apellido y referencia (insensible a mayúsculas/minúsculas) 
    const resultadoExisteCliente = await existeCliente(resultadoConectarBD.cliente, cliente.apellido, cliente.nombre, cliente.referencia, cliente._id);

    if (resultadoExisteCliente !== constantesClientes.CLIENTE_NO_REPETIDO) { //ya existe un cliente con ese nombre, apellido y referencia, o hubo algún error
        resultadoConectarBD.cliente.close();
        return resultadoExisteCliente;
    }

    //4. Se actualiza el cliente en la BD
    const bd = resultadoConectarBD.cliente.db();
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


//Obtiene todos los clientes
//Para obtener los clientes:
    //1. Se conecta a la BD
    //2. Obtiene los clientes
//Requiere de las funciones auxiliares:
    //(1) conectarBD()    
//Devuelve:
    //{
    //    mensaje : constantesConexion.ERROR_CONEXION || constantesClientes.CLIENTES_LEIDOS_CORRECTAMENTE || constantesClientes.ERROR_LEER_CLIENTES
    //    clientes : vector con los clientes leidos (si hubo error está vacío)
    //}
export const obtenerClientes = async () => {     
    let resultadoObtenerClientes = {
        mensaje : '',
        clientes : []
    }

    //1. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();
    
    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA) { //no se pudo establecer la conexión
        return {...resultadoObtenerClientes, mensaje : constantesConexion.ERROR_CONEXION};
    }        
    
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


//Obtiene el cliente con el _id especificado
//También devuelve la lista de clientes
//Para obtener el cliente:
    //1. Verifica que se haya especificado un _id
    //2. Si se especificó un _id, se conecta a la BD
    //3. Obtiene el cliente para el _id especificado
//Requiere de las funciones auxiliares:
    //(2) conectarBD()
//Parámetros:        
    //_id: _id del cliente a buscar
//Devuelve:
    //{
    //    mensaje : constantesConexion.ERROR_CONEXION || constantesClientes.CLIENTE_NULO || constantesClientes.ERROR_LEER_CLIENTES || constantesClientes.CLIENTES_LEIDOS_CORRECTAMENTE)
    //    cliente : cliente con el _id especificado, o null si no se encuentra uno
    //    clientes : lista de clientes (si hubo error está vacía)
    //}
export const obtenerClienteParaModificar = async (_id) => {
    let resultadoObtenerCliente = {
        mensaje : '',
        cliente : null,
        clientes : []
    }

    //1. Verifica que se haya especificado un _id
    if (!_id) { //no se especificó un _id            
        return {...resultadoObtenerCliente, mensaje : constantesClientes.CLIENTE_NULO};        
    }

    //2. Si se especificó un _id, se conecta a la BD

    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //3. Obtiene el cliente para el _id especificado        
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


//*************************** Funciones auxiliares ************************* */

//Dado un cliente identificado por su _id,
//devuelve el objeto Cliente correspondiente, el cual se busca en el vector "clientes"
//Si no se encuentra el _id, devuelve null
//Es un método auxiliar llamado por obtenerProductos() y verificarPedido()
//Parámetros:
	//_id: id del cliente
    //clientes: vector de clientes
//Devuelve:
    //objeto Cliente, o null
export const obtenerCliente = (_id, clientes) => {
    for(let i in clientes) {
        if (clientes[i]._id.equals(_id))
            return clientes[i];
    }
    return null;
}

//Verifica si existe un cliente con el nombre, apellido y referencia especificados
//Es un método auxiliar que lo llama agregarCliente() y modificarCliente() (por eso no se lo exporta)
//Se puede usar cuando se está creando un cliente (_id sin definir) o cuando se está modificando un cliente (_id definido)
//para eso hace una búsqueda insensible a mayúsculas/minúscuulas
//para lo cual crea índices en la colección 'clientes' que permiten hacer estas búsquedas
//El índice se crea sobre los atributos 'nombre', 'apellido' y 'referencia', en orden ascendente (1),
//utiliza el idioma español ('es') y es insensibles a mayúsculas/minúsculas (2)
//El índice se crea sólo en caso de no existir
//Una vez definido el índice, para que el mismo se use, se lo debe especificar tal cual al momento de hacer la búsqueda
//Parámetros:
    //cliente: conexión a la BD
    //nombre: nombre del cliente
    //apellido: apellido del cliente
    //referencia: referencia del cliente
    //_id: sin definir cuando se está creando un cliente, definido cuando se está modificando un cliente
//Devuelve:
    //constantesConexion.ERROR_CONEXION || 
    //constantesClientes.ERROR_CREAR_INDICE || 
    //constantesClientes.ERROR_LEER_CLIENTES || 
    //constantesClientes.CLIENTE_REPETIDO || 
    //constantesClientes.CLIENTE_NO_REPETIDO
const existeCliente = async (cliente, apellido, nombre, referencia, _id) => {  
    if (!cliente) { //no se pudo establecer la conexión        
        return constantesConexion.ERROR_CONEXION;
    }

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

//Verifica que:
    //1. El nombre del producto no esté en blanco
    //2. El precio del producto sea > 0
    //3. Los ingredientes del producto tengan un id y una unidad, y que la cantidad de los mismos sea > 0
//Parámetros:
    //nombre: nombre del producto
    //precio: precio del producto
    //ingredientes: ingredientes del producto 
//Devuelve:
    //constantesClientes.APELLIDO_EN_BLANCO ||
    //constantesClientes.NOMBRE_EN_BLANCO||
    //constantesClientes.REFERENCIA_EN_BLANCO ||
    //constantesClientes.VERIFICACION_OK
const verificarCliente = (apellido, nombre, referencia) => {
    //Se verifica que el apellido del cliente no esté en blanco
    if (apellido === '') {
        return constantesClientes.APELLIDO_EN_BLANCO;
    } 

    //Se verifica que el nombre del cliente no esté en blanco
    if (nombre === '') {
        return constantesClientes.NOMBRE_EN_BLANCO;
    } 

    //Se verifica que la referencia del cliente no esté en blanco
    if (referencia === '') {
        return constantesClientes.REFERENCIA_EN_BLANCO;
    } 

    return constantesClientes.VERIFICACION_OK;
}
