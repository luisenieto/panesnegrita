import { MongoClient, ObjectId } from 'mongodb';
import { constantes } from '../../../auxiliares/auxiliaresUnidades';
import { actualizarEquivalenciaCorrespondiente } from '../../../auxiliares/auxiliaresUnidades';


//Realiza la conexión a la BD
//Devuelve un objeto de la forma: 
//{
//  mensaje: resultado de la operación (CONEXION_EXITOSA || ERROR_CONEXION)
//  cliente: objeto cliente con la conexión a la BD si se pudo establecer, o null en caso de error
//}
export const conectarBD = async () => {
    let resultado = {
        mensaje : '',
        cliente : null
    };
    
    try {
        resultado.cliente = await MongoClient.connect('mongodb+srv://lula:zdFuV5NTaPoncAMl@cluster0.ty0xvlr.mongodb.net/panesnegrita');                
        resultado.mensaje = constantes.CONEXION_EXITOSA
    }
    catch(error) {
        resultado.mensaje = constantes.ERROR_CONEXION
    }        

	return resultado;
}

//Obtiene todas las unidades
//Devuelve: objeto de la forma:
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || UNIDADES_LEIDAS_CORRECTAMENTE || ERROR_LEER_UNIDADES)
//    unidades : vector con las unidades leidas (si hubo error está vacío)
//}
export const obtenerUnidades = async () => {      
    //conexión a la BD
    const resultadoConectarBD = await conectarBD();

    let resultadoObtenerUnidades = {
        mensaje : '',
        unidades : []
    }

    if (resultadoConectarBD.mensaje === constantes.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();
        try {
            resultadoObtenerUnidades.unidades = await bd.collection('unidades').find().toArray();
            resultadoObtenerUnidades.mensaje = constantes.UNIDADES_LEIDAS_CORRECTAMENTE;
            resultadoConectarBD.cliente.close();            
            return resultadoObtenerUnidades;
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return {...resultadoObtenerUnidades, mensaje : constantes.ERROR_LEER_UNIDADES};
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerUnidades, mensaje : constantes.ERROR_CONEXION};
    }
}

//Obtiene la unidad con el idUnidad especificado
//También devuelve la lista de unidades
//idUnidad: idUnidad a buscar
//Devuelve un objeto de la forma
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || UNIDAD_NULA || ERROR_LEER_UNIDADES || UNIDADES_LEIDAS_CORRECTAMENTE)
//    unidad : unidad con el idUnidad especificado, o null si no se encuentra una
//    unidades : lista de unidades (si hubo error está vacía)
//}
export const obtenerUnidadParaModificar = async (idUnidad) => {
    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    let resultadoObtenerUnidad = {
        mensaje : '',
        unidad : null,
        unidades : []
    }

    if (resultadoConectarBD.mensaje === constantes.CONEXION_EXITOSA) { //se pudo establecer la conexión
        if (idUnidad) { //se especificó un idUnidad
            const bd = resultadoConectarBD.cliente.db();
            try {
                let unidades = await bd.collection('unidades').find({idUnidad: {$eq: idUnidad}}).toArray(); 
                let todasLasUnidades = await bd.collection('unidades').find().toArray(); 
                resultadoConectarBD.cliente.close();
                return {
                    mensaje : constantes.UNIDADES_LEIDAS_CORRECTAMENTE,
                    unidad : unidades.length === 1 ? unidades[0] : null,
                    unidades : todasLasUnidades
                } 
                //si unidades.length === 1 es porque se encontró una única unidad
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return {...resultadoObtenerUnidad, mensaje : constantes.ERROR_LEER_UNIDADES};
            }
        }
        else { //no se especificó un idUnidad
            resultadoConectarBD.cliente.close();
            return {...resultadoObtenerUnidad, mensaje : constantes.UNIDAD_NULA};
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerUnidad, mensaje : constantes.ERROR_CONEXION};
    }
}

//Verifica si existe una unidad con el nombre especificado
//Es un método auxiliar que lo llama agregarUnidad() y modificarUnidad() (por eso no se lo exporta)
//Se puede usar cuando se está creando una unidad (idUnidad sin definir) o cuando se está modificando una unidad (idUnidad definido)
//para eso hace una búsqueda insensible a mayúsculas/minúscuulas
//para lo cual crea un índice en la colección 'unidades' que permite hacer estas búsquedas
//El índice se crea sobre el atributo 'nombre', en orden ascendente (1),
//utiliza el idioma español ('es') y es insensible a mayúsculas/minúsculas (2)
//El índice se crea sólo en caso de no existir
//Una vez definido el índice, para que el mismo se use, se lo debe especificar tal cual al momento de hacer la búsqueda
//cliente: conexión a la BD
//nombreUnidad: nombre de la unidad
//_id: sin definir cuando se está creando una unidad, definido cuando se está modificando una unidad
//Devuelve: objeto de la forma:
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_UNIDADES || UNIDADES_LEIDAS_CORRECTAMENTE)
//    existeUnidad : true o false según exista o no una unidad con ese nombre
//}
const existeUnidad = async (cliente, nombreUnidad, _id) => {    
    // let resultadoExisteUnidad = {
    //     mensaje : '',
    //     existeUnidad : false
    // }

    if (cliente) { //se pudo establecer la conexión
        const bd = cliente.db();

        //se crea el índice (si no existe)
        try {
            bd.collection('unidades').createIndex( 
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
            //return {...resultadoExisteUnidad, mensaje : constantes.ERROR_CREAR_INDICE};
            return constantes.ERROR_CREAR_INDICE;
        }

        let unidadesRepetidas;
        if (_id === undefined) { //creación de unidad
            try {
                unidadesRepetidas = await bd.collection('unidades').find({ nombre : { $eq : nombreUnidad}}).collation( { locale: 'es', strength: 2 } ).toArray();
            }
            catch(error) {             
                //return {...resultadoExisteUnidad, mensaje : constantes.ERROR_LEER_UNIDADES};
                return constantes.ERROR_LEER_UNIDADES;
            }
        }
        else { //modificación de unidad
            try {
                unidadesRepetidas = await bd.collection('unidades').find({ 
                    nombre : { $eq : nombreUnidad}, 
                    _id : { $ne : _id}
                }).collation( { locale: 'es', strength: 2 } ).toArray();
            }
            catch(error) {
                //return {...resultadoExisteUnidad, mensaje : constantes.ERROR_LEER_UNIDADES};
                return constantes.ERROR_LEER_UNIDADES;
            }
        }
        // return {
        //     mensaje : constantes.UNIDADES_LEIDAS_CORRECTAMENTE,
        //     existeUnidad : unidadesRepetidas.length > 0
        // }
        return unidadesRepetidas.length > 0 ? constantes.UNIDAD_REPETIDA : constantes.UNIDAD_NO_REPETIDA;
    }
    else { //no se pudo establecer la conexión
        //return {...resultadoExisteUnidad, mensaje : constantes.ERROR_CONEXION};
        return constantes.ERROR_CONEXION;
    }           
}

//Obtiene la unidad con el idUnidad especificado
//Es un método auxiliar que utiliza obtenerUnidadesAModificar(), por eso no se lo exporta
//idUnidad: idUnidad a buscar
//Devuelve un objeto de la forma
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || UNIDAD_NULA || ERROR_LEER_UNIDADES || UNIDADES_LEIDAS_CORRECTAMENTE)
//    unidad : unidad con el idUnidad especificado, o null si no se encuentra una
//}
const obtenerUnidad = async (cliente, idUnidad) => {    
    let resultadoObtenerUnidad = {
        mensaje : '',
        unidad : null
    }

    if (cliente) { //se pudo establecer la conexión
        if (idUnidad) { //se especificó un idUnidad
            const bd = cliente.db();
            try {
                let unidades = await bd.collection('unidades').find({idUnidad: {$eq: idUnidad}}).toArray(); 
                return {
                    mensaje : constantes.UNIDADES_LEIDAS_CORRECTAMENTE,
                    unidad : unidades.length === 1 ? unidades[0] : null
                } 
                //si unidades.length === 1 es porque se encontró una única unidad
            }
            catch(error) {
                return {...resultadoObtenerUnidad, mensaje : constantes.ERROR_LEER_UNIDADES};
            }
        }
        else { //no se especificó un idUnidad
             return {...resultadoObtenerUnidad, mensaje : constantes.UNIDAD_NULA};
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerUnidad, mensaje : constantes.ERROR_CONEXION};
    }
}

//Obtiene las unidades a modificar para actualizar sus equivalencias
//Es un método auxiliar que llama agregarUnidad() y modificarUnidad() (por eso no se lo exporta)
//suponer que se tiene un vector con las siguientes unidades definidas:
//[{idUnidad:1, nombre:'grs', equivalencias:[]}, {idUnidad:2, nombre:'ss', equivalencias:[]}]
//Y se quiere agregar una nueva unidad con los siguientes valores:
//{idUnidad: 3, nombre: 'Kg', equivalencias: [{idUnidad: 1, proporcion: 1000}, {idUnidad: 2, proporcion: 50}]}
//Al agregar la nueva unidad, el vector de unidades debería quedar:
//[{idUnidad: 1, nombre:'grs', equivalencias: [{idUnidad: 3, proporcion: 0.001}]}, 
// {idUnidad: 2, nombre: 'ss', equivalencias: [{idUnidad: 3, proporcion: 0.02}]} ,
// {idUnidad: 3, nombre: 'Kg', equivalencias: [{idUnidad: 1, proporcion: 1000}, {idUnidad: 2, proporcion: 50}]}]
//cliente: conexión a la BD
//unidad: siguiendo el ejemplo, valdría {idUnidad: 3, nombre: 'Kg', equivalencias: [{idUnidad: 1, proporcion: 1000}, {idUnidad: 2, proporcion: 50}]}
//devuelve un objeto de la forma
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || UNIDAD_NULA || ERROR_LEER_UNIDADES || UNIDADES_LEIDAS_CORRECTAMENTE)
//    unidadesAModificar : vector con las unidades a modificar
//}
const obtenerUnidadesAModificar = async (cliente, unidad) => {    
    let resultadoUnidadesAModificar = {
        mensaje : '',
        unidadesAModificar : []
    }   
    
    if (cliente) {
        if (unidad) {            
            try {
                for(let i in unidad.equivalencias) {        
                    const resultadoObtenerUnidad = await obtenerUnidad(cliente, unidad.equivalencias[i].idUnidad);            
                    if (resultadoObtenerUnidad.unidad)
                        resultadoUnidadesAModificar.unidadesAModificar.push({...resultadoObtenerUnidad.unidad, propEquivalente : 1 / unidad.equivalencias[i].proporcion});
                    
                }                    
                //Siguiendo con el ejemplo, resultadoUnidadesAModificar.unidadesAModificar queda:
                //[{idUnidad: 1, nombre:'grs', equivalencias: [], propEquivalente: 0.001},
                // {idUnidad: 2, nombre: 'ss', equivalencias: [], propEquivalente: 0.02}]
            }
            catch(error) {
                return {...resultadoUnidadesAModificar, mensaje : resultadoObtenerUnidad.mensaje};
            }
            
            for(let i in resultadoUnidadesAModificar.unidadesAModificar) {
                resultadoUnidadesAModificar.unidadesAModificar[i] = actualizarEquivalenciaCorrespondiente(resultadoUnidadesAModificar.unidadesAModificar[i], unidad.idUnidad);
            }
            //Ahora resultadoUnidadesAModificar.unidadesAModificar queda (para el ejemplo propuesto):
            //[{idUnidad: 1, nombre:'grs', equivalencias: [{idUnidad: 3, proporcion: 0.001}], propEquivalente: 0.001},
            // {idUnidad: 2, nombre: 'ss', equivalencias: [{idUnidad: 3, proporcion: 0.02}], propEquivalente: 0.02}]
            //el atributo propEquivalente no se tiene en cuenta para guardar las modificaciones en la BD       
            return {        
                ...resultadoUnidadesAModificar,
                mensaje : constantes.UNIDADES_LEIDAS_CORRECTAMENTE                
            }
        }
        else {
            return {...resultadoUnidadesAModificar, mensaje : constantes.UNIDAD_NULA};
        }        
    }
    else {
        return {...resultadoUnidadesAModificar, mensaje : constantes.ERROR_CONEXION};
    }    
}

export const obtenerUnidadesQueLaTienenComoEquivalencia = async (cliente, idUnidad) => {
    const bd = cliente.db();
    let resultado = {
        mensaje : '',
        unidadesQueLaTienenComoEquivalencia : []
    }
    
    try {
        resultado.unidadesQueLaTienenComoEquivalencia = await bd.collection('unidades').find({"equivalencias.idUnidad" : idUnidad}).toArray(); 
    }
    catch(error) {
        return {...resultado, mensaje : constantes.ERROR_LEER_UNIDADES};
    }

    return {...resultado, mensaje : constantes.UNIDADES_LEIDAS_CORRECTAMENTE};
}

//Agrega la unidad en la colección y actualiza sus equivalencias
//cliente: conexión a la BD
//unidad a agregar
//unidadesAModificar: unidades a modificar (se corresponden con las equivalencias de unidad)
//mensaje : resultado de la operación (ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_UNIDADES || UNIDAD_REPETIDA || ERROR_GUARDAR_UNIDAD || UNIDAD_CREADA)
export const agregarUnidad = async (unidad) => {
    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantes.CONEXION_EXITOSA) { //se pudo establecer la conexión
        //se verifica que no exista otra unidad con ese nombre
        //la verificación es insensible a mayúsculas/minúsculas
        const resultadoExisteUnidad = await existeUnidad(resultadoConectarBD.cliente, unidad.nombre);
        
        //if (resultadoExisteUnidad.mensaje === constantes.UNIDADES_LEIDAS_CORRECTAMENTE) { //se pudieron leer las unidades
        if (resultadoExisteUnidad === constantes.UNIDAD_NO_REPETIDA) { //no existe una unidad con ese nombre

            // if (resultadoExisteUnidad.existeUnidad) { //ya existe una unidad con ese nombre
            //     resultadoConectarBD.cliente.close();
            //     return constantes.UNIDAD_REPETIDA;
            // }
            // else { //no existe una unidad con ese nombre
                const resultadoObtenerUnidadesAModificar = await obtenerUnidadesAModificar(resultadoConectarBD.cliente, unidad);
                
                if (resultadoObtenerUnidadesAModificar.mensaje !== constantes.UNIDADES_LEIDAS_CORRECTAMENTE) {
                    resultadoConectarBD.cliente.close();
                    return resultadoObtenerUnidadesAModificar.mensaje
                }
                else {
                    const bd = resultadoConectarBD.cliente.db();
                    try {
                        await bd.collection('unidades').insertOne(unidad);
                
                        for(let i in resultadoObtenerUnidadesAModificar.unidadesAModificar) {
                            const resultado = await actualizarEquivalencias(resultadoConectarBD.cliente, resultadoObtenerUnidadesAModificar.unidadesAModificar[i]);
                        }
                        resultadoConectarBD.cliente.close();
                        return constantes.UNIDAD_CREADA;
                    }
                    catch(error) {
                        resultadoConectarBD.cliente.close();
                        return constantes.ERROR_GUARDAR_UNIDAD;
                    }                
                }                
            //}
        }
        else {//ya existe una unidad con ese nombre o hubo algún error
            resultadoConectarBD.cliente.close();
            //return resultadoExisteUnidad.mensaje;
            return resultadoExisteUnidad;
        }
    }
    else {
        return constantes.ERROR_CONEXION;
    }        
}

//Agrega la unidad en la colección y actualiza sus equivalencias
//cliente: conexión a la BD
//unidad a agregar
//unidadesAModificar: unidades a modificar (se corresponden con las equivalencias de unidad)
//resultado de la operación (ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_UNIDADES || UNIDAD_REPETIDA || UNIDAD_NULA || ERROR_GUARDAR_UNIDAD || UNIDAD_MODIFICADA)
export const modificarUnidad = async (unidad) => {
    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantes.CONEXION_EXITOSA) { //se pudo establecer la conexión
        //se verifica que no exista otra unidad con ese nombre
        //la verificación es insensible a mayúsculas/minúsculas
        const resultadoExisteUnidad = await existeUnidad(resultadoConectarBD.cliente, unidad.nombre, unidad._id);

        if (resultadoExisteUnidad.mensaje === constantes.UNIDADES_LEIDAS_CORRECTAMENTE) { //se pudieron leer las unidades
            if (resultadoExisteUnidad.existeUnidad) { //ya existe una unidad con ese nombre
                resultadoConectarBD.cliente.close();
                return constantes.UNIDAD_REPETIDA;
            }
            else { //no existe una unidad con ese nombre
                const resultadoObtenerUnidadesAModificar = await obtenerUnidadesAModificar(resultadoConectarBD.cliente, unidad);
                
                if (resultadoObtenerUnidadesAModificar.mensaje !== constantes.UNIDADES_LEIDAS_CORRECTAMENTE) {
                    resultadoConectarBD.cliente.close();
                    return resultadoObtenerUnidadesAModificar.mensaje
                }
                else {
                    const bd = resultadoConectarBD.cliente.db();
                    try {
                        await bd.collection('unidades').updateOne({_id : unidad._id}, {
                            $set : {
                                nombre : unidad.nombre,
                                equivalencias : unidad.equivalencias
                            }
                        });

                        for(let i in resultadoObtenerUnidadesAModificar.unidadesAModificar) {
                            const resultado = await actualizarEquivalencias(resultadoConectarBD.cliente, resultadoObtenerUnidadesAModificar.unidadesAModificar[i]);
                        }
                        resultadoConectarBD.cliente.close();
                        return constantes.UNIDAD_MODIFICADA;
                    }
                    catch(error) {
                        return constantes.ERROR_GUARDAR_UNIDAD;
                    }
                }
            }
        }
        else { //no se pudieron leer las unidades o dio error la creación del índice
            resultadoConectarBD.cliente.close();
            return resultadoExisteUnidad.mensaje;
        }
    }
    else { //no se pudo establecer la conexión
        return constantes.ERROR_CONEXION;
    }        

	// const bd = cliente.db();

    // try {
    //     await bd.collection('unidades').updateOne({_id : unidad._id}, {
    //         $set : {
    //             nombre : unidad.nombre,
    //             equivalencias : unidad.equivalencias
    //         }
    //     });
    
    //     for(let i in unidadesAModificar) {
    //         await actualizarEquivalencias(cliente, unidadesAModificar[i]);
    //     }
    //     return constantes.UNIDAD_MODIFICADA;    
    // }
    // catch(error) {
    //     return constantes.ERROR_GUARDAR_UNIDAD; 
    // }
}


//Busca en la BD la unidad con el _id especificado y le actualiza las equivalencias
//cliente: conexión a la BD
//unidad: unidad a la que se le actualizan las equivalencias
const actualizarEquivalencias = async (cliente, unidad) => {
    const bd = cliente.db();

    await bd.collection('unidades').updateOne({_id : unidad._id}, {
        $set : {equivalencias : unidad.equivalencias}
    });    
}

//borra la unidad especificada
export const borrarUnidad = async (cliente, unidad, unidadesAModificar) => {
    const bd = cliente.db();

    try {
        await bd.collection('unidades').deleteOne({ "_id" : new ObjectId(unidad._id) });

        for(let i in unidadesAModificar) {
            const resultado = await actualizarEquivalencias(cliente, unidadesAModificar[i]);
        }
        return constantes.UNIDAD_BORRADA;
    }
    catch(error) {
        return constantes.ERROR_BORRAR_UNIDAD;
    }
}