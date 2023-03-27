import { conectarBD } from "../conexion/conexion";
import { constantes as constantesConexion} from "../../../auxiliares/auxiliaresConexion";
import { constantes as constantesUnidades} from "../../../auxiliares/auxiliaresUnidades";
import { constantes as constantesIngredientes } from "../../../auxiliares/auxiliaresIngredientes";
import { constantes as constantesProductos } from "../../../auxiliares/auxiliaresProductos";
import { ObjectId } from 'mongodb';
import { existeProductoConEsteIngrediente } from "../productos/bdAuxiliares";
//import { obtenerNombreUnidad } from "../../../auxiliares/auxiliaresUnidades";


//*************************** Funciones de ABM y Listado ************************* */

//Agrega el ingrediente en la colección
//Para hacer el agregado:
    //1. Verifica que que el nombre del ingrediente no esté en blanco, que la cantidad en stock sea >= 0, que la cantidad mínima en stock sea >= 0 y que sea <= a la cantidad en stock y que se haya especificado una unidad para el ingrediente
    //2. Se conecta a la BD
    //3. Verifica que no exista otro ingrediente con ese nombre (insensible a mayúsculas/minúsculas)
    //4. Crea el ingrediente en la BD (en el proceso se obtiene el _id)
//Requiere de las funciones auxiliares:
    //(1) verificarIngrediente()
    //(2) conectarBD()
    //(3) existeIngrediente()
//Parámetros:
    //ingrediente: ingrediente a agregar
//Devuelve:    
    //constantesIngredientes.INGREDIENTE_EN_BLANCO ||
    //constantesIngredientes.STOCK_INVALIDO ||
    //constantesIngredientes.STOCK_MINIMO_INVALIDO || 
    //constantesIngredientes.UNIDAD_SIN_ESPECIFICAR ||
    //constantesConexion.ERROR_CONEXION || 
    //constantesIngredientes.ERROR_CREAR_INDICE || 
    //constantesIngredientes.ERROR_LEER_INGREDIENTES || 
    //constantesIngredientes.INGREDIENTE_REPETIDO || 
    //constantesIngredientes.ERROR_GUARDAR_INGREDIENTE || 
    //constantesIngredientes.INGREDIENTE_CREADO
export const agregarIngrediente = async (ingrediente) => {    
    
    //1. Verifica que que el nombre del ingrediente no esté en blanco, que la cantidad en stock sea >= 0, que la cantidad mínima en stock sea >= 0 y que sea <= a la cantidad en stock y que se haya especificado una unidad para el ingrediente
    const resultadoVerificacion = verificarIngrediente(ingrediente.nombre, ingrediente.stock, ingrediente.stockMinimo, ingrediente.idUnidad);

    if (resultadoVerificacion !== constantesIngredientes.VERIFICACION_OK) 
        return resultadoVerificacion;

    //2. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //3. Verifica que no exista otro ingrediente con ese nombre (insensible a mayúsculas/minúsculas)
    const resultadoExisteIngrediente = await existeIngrediente(resultadoConectarBD.cliente, ingrediente.nombre);
    
    if (resultadoExisteIngrediente !== constantesIngredientes.INGREDIENTE_NO_REPETIDO) { //ya existe un ingrediente con ese nombre, o hubo algún error
        resultadoConectarBD.cliente.close();
        return resultadoExisteIngrediente;
    }

    //4. Crea el ingrediente en la BD (en el proceso se obtiene el _id)
    const bd = resultadoConectarBD.cliente.db();
    try {
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

//Borra el ingrediente especificado
//Para hacer el borrado:
    //1. Se conecta a la BD
    //2. Verifica que no haya productos cuyos ingredientes lo tangan (FALTA)    
    //3. Borra de la BD el ingrediente
//Requiere de las funciones auxiliares:
    //(2) existeProductoConEsteIngrediente() (FALTA)
    //(3) conectarBD()
//Parámetros:    
    //ingrediente: ingrediente a borrar
//Devuelve:
    //constantesConexion.ERROR_CONEXION || 
    //constantesProductos.PRODUCTOS_CON_EL_INGREDIENTE ||
    //constantesIngredientes.ERROR_BORRAR_INGREDIENTE || 
    //constantesProductos.PRODUCTOS_CON_EL_INGREDIENTE ||
    //constantesIngredientes.INGREDIENTE_BORRADO
export const borrarIngrediente = async (ingrediente) => {    

    //1. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;
    
    //2. Verifica que no haya productos cuyos ingredientes lo tangan (FALTA)           
    const bd = resultadoConectarBD.cliente.db();

    const hayProductosConEsteIngrediente = await existeProductoConEsteIngrediente(resultadoConectarBD.cliente, new ObjectId(ingrediente._id));
    if (hayProductosConEsteIngrediente === constantesProductos.PRODUCTOS_CON_EL_INGREDIENTE) {
        resultadoConectarBD.cliente.close();
        return hayProductosConEsteIngrediente;
    }

    //3. Borra de la BD el ingrediente
    
    try {  
        await bd.collection('ingredientes').deleteOne({ "_id" : new ObjectId(ingrediente._id) });
        resultadoConectarBD.cliente.close();
        return constantesIngredientes.INGREDIENTE_BORRADO;
    }
    catch(error) {
        resultadoConectarBD.cliente.close();
        return constantesIngredientes.ERROR_BORRAR_INGREDIENTE;
    }        
}


//Modifica el ingrediente en la colección
//Para hacer la modificación:
    //1. Verifica que que el nombre del ingrediente no esté en blanco, que la cantidad en stock sea >= 0, que la cantidad mínima en stock sea >= 0 y que sea <= a la cantidad en stock y que se haya especificado una unidad para el ingrediente
    //2. Se conecta a la BD
    //3. Verifica que no exista otro ingrediente con ese nombre (insensible a mayúsculas/minúsculas)
    //4. Actualiza el ingrediente en la BD
//Requiere de las funciones auxiliares:
    //(1) verificarIngrediente()
    //(2) conectarBD()
    //(3) existeIngrediente()    
//Parámetros:    
    //ingrediente: ingrediente a modificar
//Devuelve:
    //constantesIngredientes.INGREDIENTE_EN_BLANCO ||
    //constantesIngredientes.STOCK_INVALIDO ||
    //constantesIngredientes.STOCK_MINIMO_INVALIDO || 
    //constantesIngredientes.UNIDAD_SIN_ESPECIFICAR ||
    //constantesConexion.ERROR_CONEXION || 
    //constantesIngredientes.ERROR_CREAR_INDICE || 
    //constantesIngredientes.ERROR_LEER_INGREDIENTES || 
    //constantesIngredientes.INGREDIENTE_REPETIDO || 
    //constantesIngredientes.ERROR_ACTUALIZAR_INGREDIENTE || 
    //constantesIngredientes.INGREDIENTE_MODIFICADO
export const modificarIngrediente = async (ingrediente) => {    
    //1. Verifica que que el nombre del ingrediente no esté en blanco, que la cantidad en stock sea >= 0, que la cantidad mínima en stock sea >= 0 y que sea <= a la cantidad en stock y que se haya especificado una unidad para el ingrediente
    const resultadoVerificacion = verificarIngrediente(ingrediente.nombre, ingrediente.stock, ingrediente.stockMinimo, ingrediente.idUnidad);

    if (resultadoVerificacion !== constantesIngredientes.VERIFICACION_OK) 
        return resultadoVerificacion;

    //2. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;    
        
    //3. Verifica que no exista otro ingrediente con ese nombre (insensible a mayúsculas/minúsculas)
    const resultadoExisteIngrediente = await existeIngrediente(resultadoConectarBD.cliente, ingrediente.nombre, ingrediente._id);
    
    if (resultadoExisteIngrediente !== constantesIngredientes.INGREDIENTE_NO_REPETIDO) { //ya existe un ingrediente con ese nombre, o hubo algún error
        resultadoConectarBD.cliente.close();
        return resultadoExisteIngrediente;
    }

    //4. Actualiza el ingrediente en la BD
    const bd = resultadoConectarBD.cliente.db();
    try {                          
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


//Obtiene todos los ingredientes
//Para obtener los ingredientes:
    //1. Se conecta a la BD
    //2. Obtiene los ingredientes
//Requiere de las funciones auxiliares:
    //(1) conectarBD()
//Devuelve: objeto de la forma:
    //{
    //    mensaje : constantesConexion.ERROR_CONEXION || constantesUnidades.ERROR_LEER_UNIDADES || constantesIngredientes.INGREDIENTES_LEIDOS_CORRECTAMENTE || constantesIngredientes.ERROR_LEER_INGREDIENTES
    //    ingredientes : vector con los ingredientes leidos (si hubo error está vacío)
    //}
export const obtenerIngredientes = async () => {     
    let resultadoObtenerIngredientes = {
        mensaje : '',
        ingredientes : []
    }

    //1. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;    

    //2. Obtiene los ingredientes
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

//Obtiene el ingrediente con el _id especificado, o null si no encuentra uno
//También devuelve la lista de ingredientes
//Para obtener el ingrediente:
    //1. Verifica que se haya especificado un _id
    //2. Si se especificó un _id, se conecta a la BD
    //3. Obtiene el ingrediente para el _id especificado
//Requiere de las funciones auxiliares:
    //(2) conectarBD()      
//Parámetros:    
    //_id: __id del ingrediente a buscar
//Devuelve:
    //{
    //    mensaje : constantesConexion.ERROR_CONEXION || constantesIngredientes.INGREDIENTE_NULO || constantesIngredientes.ERROR_LEER_INGREDIENTES || constantesIngredientes.INGREDIENTES_LEIDOS_CORRECTAMENTE)
    //    ingrediente : ingrediente con el _id especificado, o null si no se encuentra uno
    //    ingredientes : lista de ingredientes (si hubo error está vacía)
    //}
export const obtenerIngredienteParaModificar = async (_id) => {        
    let resultadoObtenerIngrediente = {
        mensaje : '',
        ingrediente : null,
        ingredientes : []
    }

    //1. Verifica que se haya especificado un _id
    if (!_id) { //no se especificó un _id            
        return {...resultadoObtenerIngrediente, mensaje : constantesIngredientes.INGREDIENTE_NULO};        
    }

    //2. Si se especificó un _id, se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje !== constantesConexion.CONEXION_EXITOSA)  //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;

    //3. Obtiene el ingrediente para el _id especificado
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





//*************************** Funciones auxiliares ************************* */

//Verifica si existe un ingrediente con el nombre especificado
//Es un método auxiliar que lo llama agregarIngrediente() y modificarIngrediente() (por eso no se lo exporta)
//Se puede usar cuando se está creando un ingrediente (_id sin definir) o cuando se está modificando un ingrediente (_id definido)
//para eso hace una búsqueda insensible a mayúsculas/minúscuulas
//para lo cual crea un índice en la colección 'ingredientes' que permite hacer estas búsquedas
//El índice se crea sobre el atributo 'nombre', en orden ascendente (1),
//utiliza el idioma español ('es') y es insensible a mayúsculas/minúsculas (2)
//El índice se crea sólo en caso de no existir
//Una vez definido el índice, para que el mismo se use, se lo debe especificar tal cual al momento de hacer la búsqueda
//Parámetros:
    //cliente: conexión a la BD
    //nombreIngrediente: nombre del ingrediente
    //_id: sin definir cuando se está creando un ingrediente, definido cuando se está modificando un ingrediente
//Devuelve:
    //constantesConexion.ERROR_CONEXION || 
    //constantesIngredientes.ERROR_CREAR_INDICE || 
    //constantesIngredientes.ERROR_LEER_INGREDIENTES || 
    //constantesIngredientes.INGREDIENTE_REPETIDO || 
    //constantesIngredientes.INGREDIENTE_NO_REPETIDO
const existeIngrediente = async (cliente, nombreIngrediente, _id) => {    
    if (!cliente) { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION; 
    }


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

//Verifica si existe un ingrediente con la unidad especificada
//Es un método auxiliar que lo llama borrarUnidad() 
//Para hacer la verificación:
    //1. Verifica que se haya establecido la conexión a la BD
    //2. Realiza la verificación
//Parámetros:
    //cliente: conexión a la BD
    //idUnidad: _id de la unidad a buscar
//Devuelve: 
    //constantesConexion.ERROR_CONEXION || 
    //constantesIngredientes.ERROR_LEER_INGREDIENTES || 
    //constantesIngredientes.INGREDIENTES_CON_LA_UNIDAD || 
    //constantesIngredientes.INGREDIENTES_SIN_LA_UNIDAD
export const existeIngredienteConEstaUnidad = async (cliente, idUnidad) => {  

    //1. Verifica que se haya establecido la conexión a la BD  
    if (!cliente) { //se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION; 
    }

    //2. Realiza la verificación
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
    
//Verifica que:
    //1. El nombre del ingrediente no esté en blanco 
    //2. La la cantidad en stock sea >= 0 
    //3. La cantidad mínima en stock sea >= 0 y que sea <= a la cantidad en stock
    //4. Que se haya especificado una unidad para el ingrediente
//Parámetros:
    //nombre: nombre del ingrediente
    //stock: cantidad en stock del ingrediente
    //stockMinimo: cantidad mínima en stock del ingrediente
    //idUnidad: id de la unidad del ingrediente
//Devuelve:
    //constantesIngredientes.INGREDIENTE_EN_BLANCO ||
    //constantesIngredientes.STOCK_INVALIDO ||
    //constantesIngredientes.STOCK_MINIMO_INVALIDO || 
    //constantesIngredientes.UNIDAD_SIN_ESPECIFICAR ||
    //constantesIngredientes.VERIFICACION_OK
const verificarIngrediente = (nombre, stock, stockMinimo, idUnidad) => {
    //se verifica que el nombre del ingrediente no esté en blanco
    if (nombre === '') {
        return constantesIngredientes.INGREDIENTE_EN_BLANCO;    
    } 

    //se verifica que la cantidad en stock sea >= 0
    if (stock < 0) {
        return constantesIngredientes.STOCK_INVALIDO;
    }

    //se verifica que la cantidad mínima en stock sea >= 0 y que sea <= a la cantidad en stock
    if (stockMinimo < 0 || stockMinimo > stock) {
        return constantesIngredientes.STOCK_MINIMO_INVALIDO;
    }

    //se verifica que se haya especificado una unidad para el ingrediente
    if (!idUnidad) {
        return constantesIngredientes.UNIDAD_SIN_ESPECIFICAR;
    }

    return constantesIngredientes.VERIFICACION_OK;
}


//Agrega al vector de ingredientes el nombre de cada unidad
//Parámetros:
    //ingredientes: vector con todos los ingredientes:
        //{
            //_id : xxx,
            //nombre : xxx,
            //stock: xxx,
            //stockMinimo : xxx,
            //idUnidad : xxx
        //}
    //unidades: vector con todas las unidades
//Devuelve: 
    //vector con todos los ingredientes con el agregado del atributo para el nombre de la unidad:
        //{
            //_id : xxx,
            //nombre : xxx,
            //stock: xxx,
            //stockMinimo : xxx,
            //idUnidad : xxx,
            //nombreUnidad : xxx
        //}    
const agregarNombreUnidades = (ingredientes, unidades) => {
    let ingredientesUpdate = [];

    for(let i in ingredientes) 
        ingredientesUpdate.push({
            ...ingredientes[i], 
            nombreUnidad : obtenerNombreUnidad(ingredientes[i].idUnidad, unidades)
        });
    
    return ingredientesUpdate;
}



//Dada una unidad identificada por su _id, y el conjunto de unidades,
//devuelve el nombre de la misma
//Si no hay una unidad con ese _id, devuelve constantesUnidades.INDEFINIDA
//Es un método auxiliar llamado por agregarNombreUnidades() (por eso no se lo exporta)
//No se usa el método obtenerNombreUnidad() definido en auxiliaresUnidades porque ese trabaja con strings para los _id
//Parámetros:
    //_id: _id de la unidad (es un ObjectId)
    //unidades: vector de unidades
//Devuelve:
    //el nombre de la unidad || constantesUnidades.INDEFINIDA
const obtenerNombreUnidad = (_id, unidades) => {
    for(let i in unidades) {
        if (unidades[i]._id.equals(_id))
            return unidades[i].nombre;
    }
    return constantesUnidades.INDEFINIDA;
}