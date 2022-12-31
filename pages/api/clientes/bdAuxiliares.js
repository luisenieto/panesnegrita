import { conectarBD } from "../unidades/bdAuxiliares";
import { constantes as constantesUnidades } from "../../../auxiliares/auxiliaresUnidades";
import { constantes as constantesClientes } from "../../../auxiliares/auxiliaresClientes";
import fs from 'fs';
import path from 'path';

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

//Verifica si existe un cliente con el nombre y referencia especificados
//Es un método auxiliar que lo llama agregarCliente() y modificarCliente() (por eso no se lo exporta)
//Se puede usar cuando se está creando un cliente (_id sin definir) o cuando se está modificando un cliente (_id definido)
//para eso hace una búsqueda insensible a mayúsculas/minúscuulas
//para lo cual crea índices en la colección 'clientes' que permiten hacer estas búsquedas
//Los índices se crea sobre los atributos 'nombre' y 'referencia', en orden ascendente (1),
//utilizan el idioma español ('es') y son insensibles a mayúsculas/minúsculas (2)
//Los índices se crean sólo en caso de no existir
//Una vez definidos los índices, para que los mismos se usen, se los debe especificar tal cual al momento de hacer la búsqueda
//cliente: conexión a la BD
//nombre: nombre del cliente
//referencia: referencia del cliente
//_id: sin definir cuando se está creando un cliente, definido cuando se está modificando un cliente
//Devuelve el resultado de la operación: ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_CLIENTES || CLIENTE_REPETIDO || CLIENTE_NO_REPETIDO
const existeCliente = async (cliente, nombre, referencia, _id) => {    
    if (cliente) { //se pudo establecer la conexión
        const bd = cliente.db();

        //se crean los índices (si no existen)
        try {
            bd.collection('clientes').createIndex( 
                { 'nombre' : 1 },
                { collation: 
                    {
                        locale : 'es',
                        strength : 2
                    }
                }
            );  

            bd.collection('clientes').createIndex( 
                { 'referencia' : 1 },
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
                    nombre : { $eq : nombre},
                    referencia : { $eq : referencia}
                }).collation( { locale: 'es', strength: 2 } ).toArray();
            }
            catch(error) {             
                return constantesClientes.ERROR_LEER_CLIENTES;
            }
        }
        else { //modificación de cliente
            try {
                clientesRepetidos = await bd.collection('clientes').find({ 
                    nombre : { $eq : nombreIngrediente}, 
                    referencia : { $eq : referencia}, 
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
        //1. Se verifica que no exista otro cliente con el mismo nombre y referencia (insensible a mayúsculas/minúsculas)
        //2. Se crea el cliente en la BD (en el proceso se obtiene el _id)

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        //1. Se verifica que no exista otro cliente con el mismo nombre y referencia (insensible a mayúsculas/minúsculas)
        const resultadoExisteCliente = await existeCliente(resultadoConectarBD.cliente, cliente.nombre, cliente.referencia);
        
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
