import { conectarBD, obtenerUnidades } from "../unidades/bdAuxiliares";
import { constantes as constantesUnidades} from "../../../auxiliares/auxiliaresUnidades";
import { constantes as constantesIngredientes } from "../../../auxiliares/auxiliaresIngredientes";
import { ObjectId } from 'mongodb';

//Obtiene todos los ingredientes
//Devuelve: objeto de la forma:
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || ERROR_LEER_UNIDADES || INGREDIENTES_LEIDOS_CORRECTAMENTE || ERROR_LEER_INGREDIENTES)
//    ingredientes : vector con los ingredientes leidos (si hubo error está vacío)
//}
export const obtenerIngredientes = async () => {     
    let resultadoObtenerIngredientes = {
        mensaje : '',
        ingredientes : []
    }

    //conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();
        try {
            let ingredientes = await bd.collection('ingredientes').find().toArray();
            resultadoObtenerIngredientes.mensaje = constantesIngredientes.INGREDIENTES_LEIDOS_CORRECTAMENTE;

            const unidades = await bd.collection('unidades').find().toArray();
            ingredientes = agregarNombreUnidades(ingredientes, unidades);
            resultadoObtenerIngredientes.ingredientes = ingredientes;
            resultadoConectarBD.cliente.close();            
            return resultadoObtenerIngredientes;
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return {...resultadoObtenerIngredientes, mensaje : constantesIngredientes.ERROR_LEER_INGREDIENTES};
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerIngredientes, mensaje : constantesUnidades.ERROR_CONEXION};
    }
    
}

//Agrega al vector de ingredientes el nombre de cada unidad
const agregarNombreUnidades = (ingredientes, unidades) => {
    let ingredientesUpdate = [];

    for(let i in ingredientes) 
        ingredientesUpdate.push({...ingredientes[i], nombreUnidad : obtenerNombreUnidad(ingredientes[i].idUnidad, unidades)});
    
    return ingredientesUpdate;
}

//Dada una unidad identificada por su _id, y el conjunto de unidades,
//devuelve el nombre de la misma
//Si no hay una unidad con ese _id, devuelve constantesUnidades.INDEFINIDA
const obtenerNombreUnidad = (_id, unidades) => {
    for(let i in unidades) {
        if (unidades[i]._id.equals(_id))
            return unidades[i].nombre;
    }
    return constantesUnidades.INDEFINIDA;
}

//Verifica si existe un ingrediente con el nombre especificado
//Es un método auxiliar que lo llama agregarIngrediente() y modificarIngrediente() (por eso no se lo exporta)
//Se puede usar cuando se está creando un ingrediente (_id sin definir) o cuando se está modificando un ingrediente (_id definido)
//para eso hace una búsqueda insensible a mayúsculas/minúscuulas
//para lo cual crea un índice en la colección 'ingredientes' que permite hacer estas búsquedas
//El índice se crea sobre el atributo 'nombre', en orden ascendente (1),
//utiliza el idioma español ('es') y es insensible a mayúsculas/minúsculas (2)
//El índice se crea sólo en caso de no existir
//Una vez definido el índice, para que el mismo se use, se lo debe especificar tal cual al momento de hacer la búsqueda
//cliente: conexión a la BD
//nombreIngrediente: nombre del ingrediente
//_id: sin definir cuando se está creando un ingrediente, definido cuando se está modificando un ingrediente
//Devuelve el resultado de la operación: ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_INGREDIENTES || INGREDIENTE_REPETIDO || INGREDIENTE_NO_REPETIDO
const existeIngrediente = async (cliente, nombreIngrediente, _id) => {    
    if (cliente) { //se pudo establecer la conexión
        const bd = cliente.db();

        //se crea el índice (si no existe)
        try {
            bd.collection('ingredientes').createIndex( 
                { 'nombre' : 1 },
                { collation: 
                    {
                        locale : 'es',
                        strength : 2
                    }
                }
            );            
        }
        catch(error) {
            return constantesIngredientes.ERROR_CREAR_INDICE;
        }

        let ingredientesRepetidos;
        if (_id === undefined) { //creación de ingrediente
            try {
                ingredientesRepetidos = await bd.collection('ingredientes').find({ nombre : { $eq : nombreIngrediente}}).collation( { locale: 'es', strength: 2 } ).toArray();
            }
            catch(error) {             
                return constantesIngredientes.ERROR_LEER_INGREDIENTES;
            }
        }
        else { //modificación de ingrediente
            try {
                ingredientesRepetidos = await bd.collection('ingredientes').find({ 
                    nombre : { $eq : nombreIngrediente}, 
                    _id : { $ne : _id}
                }).collation( { locale: 'es', strength: 2 } ).toArray();
            }
            catch(error) {
                return constantesIngredientes.ERROR_LEER_INGREDIENTES;
            }
        }
        return ingredientesRepetidos.length > 0 ? constantesIngredientes.INGREDIENTE_REPETIDO : constantesIngredientes.INGREDIENTE_NO_REPETIDO;
    }
    else { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION; 
    }           
}


//Verifica si existe un ingrediente con la unidad especificada
//Es un método auxiliar que lo llama borrarUnidad() 
//cliente: conexión a la BD
//idUnidad: _id de la unidad a buscar
//Devuelve: ERROR_CONEXION || ERROR_LEER_INGREDIENTES || INGREDIENTES_CON_LA_UNIDAD || INGREDIENTES_SIN_LA_UNIDAD
export const existeIngredienteConEstaUnidad = async (cliente, idUnidad) => {    
    if (cliente) { //se pudo establecer la conexión
        const bd = cliente.db();

        let ingredientesConEstaUnidad;
        try {
            ingredientesConEstaUnidad = await bd.collection('ingredientes').find({ idUnidad : { $eq : idUnidad} }).toArray();
        }
        catch(error) {
            return constantesIngredientes.ERROR_LEER_INGREDIENTES;
        }

        return ingredientesConEstaUnidad.length > 0 ? constantesIngredientes.INGREDIENTES_CON_LA_UNIDAD : constantesIngredientes.INGREDIENTES_SIN_LA_UNIDAD;
    }
    else { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION; 
    }           
}



//Agrega el ingrediente en la colección
//ingrediente: ingrediente a agregar
//mensaje : resultado de la operación (ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_INGREDIENTES || INGREDIENTE_REPETIDO || ERROR_GUARDAR_INGREDIENTE || INGREDIENTE_CREADO)
export const agregarIngrediente = async (ingrediente) => {    
    //Para hacer el agregado:
        //1. Se verifica que no exista otro ingrediente con ese nombre (insensible a mayúsculas/minúsculas)
        //2. Se crea el ingrediente en la BD (en el proceso se obtiene el _id)

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        //1. Se verifica que no exista otro ingrediente con ese nombre (insensible a mayúsculas/minúsculas)
        const resultadoExisteIngrediente = await existeIngrediente(resultadoConectarBD.cliente, ingrediente.nombre);
        
        if (resultadoExisteIngrediente === constantesIngredientes.INGREDIENTE_NO_REPETIDO) { //no existe un ingrediente con ese nombre

            const bd = resultadoConectarBD.cliente.db();
            try {
                //2. Se crea el ingrediente en la BD (en el proceso se obtiene el _id)
                const resultadoInsertarIngrediente = await bd.collection('ingredientes').insertOne(ingrediente);
                //cuando se está creando un ingrediente, no existe _id
                //una vez creado, se obtiene un _id, el cual se recupera en resultadoInsertarIngrediente.insertedId

                resultadoConectarBD.cliente.close();
                return constantesIngredientes.INGREDIENTE_CREADO;
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return constantesIngredientes.ERROR_GUARDAR_INGREDIENTE;
            }                
        }
        else {//ya existe un ingrediente con ese nombre o hubo algún error
            resultadoConectarBD.cliente.close();
            return resultadoExisteIngrediente;
        }
    }
    else {
        return constantesUnidades.ERROR_CONEXION;
    }        
}

//Obtiene el ingrediente con el _id especificado
//También devuelve la lista de ingredientes
//_id: _id a buscar
//Devuelve un objeto de la forma
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || INGREDIENTE_NULO || ERROR_LEER_INGREDIENTES || INGREDIENTES_LEIDOS_CORRECTAMENTE)
//    ingrediente : ingrediente con el _id especificado, o null si no se encuentra uno
//    ingredientes : lista de ingredientes (si hubo error está vacía)
//}
export const obtenerIngredienteParaModificar = async (_id) => {
    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    let resultadoObtenerIngrediente = {
        mensaje : '',
        ingrediente : null,
        ingredientes : []
    }

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        if (_id) { //se especificó un _id
            const bd = resultadoConectarBD.cliente.db();
            try {
                let ingredientes = await bd.collection('ingredientes').find({_id: {$eq: _id}}).toArray(); 
                let todosLosIngredientes = await bd.collection('ingredientes').find().toArray(); 
                resultadoConectarBD.cliente.close();
                return {
                    mensaje : constantesIngredientes.INGREDIENTES_LEIDOS_CORRECTAMENTE,
                    ingrediente : ingredientes.length === 1 ? ingredientes[0] : null,
                    ingredientes : todosLosIngredientes
                } 
                //si ingredientes.length === 1 es porque se encontró un único ingrediente
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return {...resultadoObtenerIngrediente, mensaje : constantesIngredientes.ERROR_LEER_INGREDIENTES};
            }
        }
        else { //no se especificó un _id
            resultadoConectarBD.cliente.close();
            return {...resultadoObtenerIngrediente, mensaje : constantesIngredientes.INGREDIENTE_NULO};
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerUnidad, mensaje : constantesUnidades.ERROR_CONEXION};
    }
}

//Modifica el ingrediente en la colección
//ingrediente a modificar
//Devuelve el resultado de la operación: ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_INGREDIENTES || INGREDIENTE_REPETIDO || ERROR_ACTUALIZAR_INGREDIENTE || INGREDIENTE_MODIFICADO
export const modificarIngrediente = async (ingrediente) => {    
    //Para hacer la modificación:
        //1. Se verifica que no exista otro ingrediente con ese nombre (insensible a mayúsculas/minúsculas)
        //2. Se actualiza el ingrediente en la BD

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();

        //1. Se verifica que no exista otro ingrediente con ese nombre (insensible a mayúsculas/minúsculas)
        const resultadoExisteIngrediente = await existeIngrediente(resultadoConectarBD.cliente, ingrediente.nombre, ingrediente._id);
        
        if (resultadoExisteIngrediente === constantesIngredientes.INGREDIENTE_NO_REPETIDO) { //no existe un ingrediente con ese nombre

            try {                          
                //2. Se actualiza el ingrediente en la BD
                await bd.collection('ingredientes').updateOne({_id : ingrediente._id}, {
                    $set : {
                        nombre : ingrediente.nombre,
                        stock : ingrediente.stock,
                        stockMinimo : ingrediente.stockMinimo,
                        idUnidad : ingrediente.idUnidad
                    }
                }); 
                
                resultadoConectarBD.cliente.close();
                return constantesIngredientes.INGREDIENTE_MODIFICADO;
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return constantesIngredientes.ERROR_ACTUALIZAR_INGREDIENTE;
            }
        }
        else {//ya existe un ingrediente con ese nombre o hubo algún error
            resultadoConectarBD.cliente.close();
            return resultadoExisteIngrediente;
        }
    }
    else { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION;
    } 
}

//Borra el ingrediente especificado
//ingrediente: ingrediente a borrar
//Devuelve el resultado de la operación: ERROR_CONEXION || ERROR_BORRAR_INGREDIENTE || INGREDIENTE_BORRADO
export const borrarIngrediente = async (ingrediente) => {
    //Para hacer el borrado:
        //1. Se comprueba que no haya productos con el ingrediente (falta)
        //2. Se borra de la BD el ingrediente

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();
    
    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();

        try {
            //2. Se borra de la BD el ingrediente            
            await bd.collection('ingredientes').deleteOne({ "_id" : new ObjectId(ingrediente._id) });
            resultadoConectarBD.cliente.close();
            return constantesIngredientes.INGREDIENTE_BORRADO;
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return constantesIngredientes.ERROR_BORRAR_INGREDIENTE;
        }    
    }
    else { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION;
    }   
}

