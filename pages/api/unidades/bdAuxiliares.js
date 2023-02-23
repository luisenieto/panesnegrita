import { MongoClient, ObjectId } from 'mongodb';
import { constantes as constantesUnidades } from '../../../auxiliares/auxiliaresUnidades';
import { constantes as constantesIngredientes } from '../../../auxiliares/auxiliaresIngredientes';
import { existeIngredienteConEstaUnidad } from '../ingredientes/bdAuxiliares';

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
        resultado.mensaje = constantesUnidades.CONEXION_EXITOSA
    }
    catch(error) {
        resultado.mensaje = constantesUnidades.ERROR_CONEXION
    }        

	return resultado;
}

//Obtiene todas las unidades, ordenadas alfabéticamente
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

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();
        try {
            resultadoObtenerUnidades.unidades = await bd.collection('unidades').find().sort({ 'nombre' : 1}).toArray();
            //1: ordenado ascendentemente
            resultadoObtenerUnidades.mensaje = constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE;
            resultadoConectarBD.cliente.close();            
            return resultadoObtenerUnidades;
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return {...resultadoObtenerUnidades, mensaje : constantesUnidades.ERROR_LEER_UNIDADES};
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerUnidades, mensaje : constantesUnidades.ERROR_CONEXION};
    }
}

//Obtiene la unidad con el _id especificado
//También devuelve la lista de unidades
//_id: _id a buscar
//Devuelve un objeto de la forma
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || UNIDAD_NULA || ERROR_LEER_UNIDADES || UNIDADES_LEIDAS_CORRECTAMENTE)
//    unidad : unidad con el _id especificado, o null si no se encuentra una
//    unidades : lista de unidades (si hubo error está vacía)
//}
export const obtenerUnidadParaModificar = async (_id) => {
    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    let resultadoObtenerUnidad = {
        mensaje : '',
        unidad : null,
        unidades : []
    }

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        if (_id) { //se especificó un _id
            const bd = resultadoConectarBD.cliente.db();
            try {
                let unidades = await bd.collection('unidades').find({_id: {$eq: _id}}).toArray(); 
                let todasLasUnidades = await bd.collection('unidades').find().toArray(); 
                resultadoConectarBD.cliente.close();
                return {
                    mensaje : constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE,
                    unidad : unidades.length === 1 ? unidades[0] : null,
                    unidades : todasLasUnidades
                } 
                //si unidades.length === 1 es porque se encontró una única unidad
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return {...resultadoObtenerUnidad, mensaje : constantesUnidades.ERROR_LEER_UNIDADES};
            }
        }
        else { //no se especificó un _id
            resultadoConectarBD.cliente.close();
            return {...resultadoObtenerUnidad, mensaje : constantesUnidades.UNIDAD_NULA};
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerUnidad, mensaje : constantesUnidades.ERROR_CONEXION};
    }
}

//Verifica si existe una unidad con el nombre especificado
//Es un método auxiliar que lo llama agregarUnidad() y modificarUnidad() (por eso no se lo exporta)
//Se puede usar cuando se está creando una unidad (_id sin definir) o cuando se está modificando una unidad (_id definido)
//para eso hace una búsqueda insensible a mayúsculas/minúscuulas
//para lo cual crea un índice en la colección 'unidades' que permite hacer estas búsquedas
//El índice se crea sobre el atributo 'nombre', en orden ascendente (1),
//utiliza el idioma español ('es') y es insensible a mayúsculas/minúsculas (2)
//El índice se crea sólo en caso de no existir
//Una vez definido el índice, para que el mismo se use, se lo debe especificar tal cual al momento de hacer la búsqueda
//cliente: conexión a la BD
//nombreUnidad: nombre de la unidad
//_id: sin definir cuando se está creando una unidad, definido cuando se está modificando una unidad
//Devuelve el resultado de la operación: ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_UNIDADES || UNIDAD_REPETIDA || UNIDAD_NO_REPETIDA
const existeUnidad = async (cliente, nombreUnidad, _id) => {    
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
            return constantesUnidades.ERROR_CREAR_INDICE;
        }

        let unidadesRepetidas;
        if (_id === undefined) { //creación de unidad
            try {
                unidadesRepetidas = await bd.collection('unidades').find({ nombre : { $eq : nombreUnidad}}).collation( { locale: 'es', strength: 2 } ).toArray();
            }
            catch(error) {             
                return constantesUnidades.ERROR_LEER_UNIDADES;
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
                return constantesUnidades.ERROR_LEER_UNIDADES;
            }
        }
        return unidadesRepetidas.length > 0 ? constantesUnidades.UNIDAD_REPETIDA : constantesUnidades.UNIDAD_NO_REPETIDA;
    }
    else { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION;
    }           
}

//Obtiene la unidad con el _id especificado
//Es un método auxiliar que utiliza obtenerUnidadesAModificar(), por eso no se lo exporta
//_id: _id a buscar
//Devuelve un objeto de la forma
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || UNIDAD_NULA || ERROR_LEER_UNIDADES || UNIDADES_LEIDAS_CORRECTAMENTE)
//    unidad : unidad con el _id especificado, o null si no se encuentra una
//}
const obtenerUnidad = async (cliente, _id) => {    
    let resultadoObtenerUnidad = {
        mensaje : '',
        unidad : null
    }

    if (cliente) { //se pudo establecer la conexión
        if (_id) { //se especificó un _id
            const bd = cliente.db();
            try {
                let unidades = await bd.collection('unidades').find({_id: {$eq: _id}}).toArray(); 
                return {
                    mensaje : constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE,
                    unidad : unidades.length === 1 ? unidades[0] : null
                } 
                //si unidades.length === 1 es porque se encontró una única unidad
            }
            catch(error) {
                return {...resultadoObtenerUnidad, mensaje : constantesUnidades.ERROR_LEER_UNIDADES};
            }
        }
        else { //no se especificó un _id
             return {...resultadoObtenerUnidad, mensaje : constantesUnidades.UNIDAD_NULA};
        }
    }
    else { //no se pudo establecer la conexión
        return {...resultadoObtenerUnidad, mensaje : constantesUnidades.ERROR_CONEXION};
    }
}

//Obtiene las unidades a modificar para actualizar sus equivalencias
//Es un método auxiliar que llama agregarUnidad() y modificarUnidad() (por eso no se lo exporta)
//suponer que se tiene un vector con las siguientes unidades definidas:
//[{_id:1, nombre:'grs', equivalencias:[]}, {_id:2, nombre:'ss', equivalencias:[]}]
//Y se quiere agregar una nueva unidad con los siguientes valores:
//{_id: 3, nombre: 'Kg', equivalencias: [{_id: 1, proporcion: 1000}, {_id: 2, proporcion: 50}]}
//Al agregar la nueva unidad, el vector de unidades debería quedar:
//[{_id: 1, nombre:'grs', equivalencias: [{_id: 3, proporcion: 0.001}]}, 
// {_id: 2, nombre: 'ss', equivalencias: [{_id: 3, proporcion: 0.02}]} ,
// {_id: 3, nombre: 'Kg', equivalencias: [{_id: 1, proporcion: 1000}, {_id: 2, proporcion: 50}]}]
//cliente: conexión a la BD
//unidad: siguiendo el ejemplo, valdría {_id: 3, nombre: 'Kg', equivalencias: [{_id: 1, proporcion: 1000}, {_id: 2, proporcion: 50}]}
//devuelve un objeto de la forma
//{
//    mensaje : resultado de la operación (ERROR_CONEXION || UNIDAD_NULA || ERROR_LEER_UNIDADES || UNIDADES_LEIDAS_CORRECTAMENTE)
//    unidadesAModificar : vector con las unidades a modificar
//}
const obtenerUnidadesAModificar = async (cliente, unidad) => {   
    //el _id de unidad es ObjectId
    let resultadoUnidadesAModificar = {
        mensaje : '',
        unidadesAModificar : []
    }   
    
    if (cliente) {
        if (unidad) {              
            try {
                for(let i in unidad.equivalencias) {        
                    const resultadoObtenerUnidad = await obtenerUnidad(cliente, unidad.equivalencias[i]._id);                                                    
                    if (resultadoObtenerUnidad.unidad)
                        resultadoUnidadesAModificar.unidadesAModificar.push({...resultadoObtenerUnidad.unidad, propEquivalente : 1 / unidad.equivalencias[i].proporcion});                    
                }  
                //Siguiendo con el ejemplo, resultadoUnidadesAModificar.unidadesAModificar queda:
                //[{_id: 1, nombre:'grs', equivalencias: [], propEquivalente: 0.001},
                // {_id: 2, nombre: 'ss', equivalencias: [], propEquivalente: 0.02}]
            }
            catch(error) {
                return {...resultadoUnidadesAModificar, mensaje : resultadoObtenerUnidad.mensaje};
            }
            
            for(let i in resultadoUnidadesAModificar.unidadesAModificar) {
                const unidadAModificar = resultadoUnidadesAModificar.unidadesAModificar[i];
                const equivalenciasAModificar = unidadAModificar.equivalencias;

                if (equivalenciasAModificar.length === 0) { //la unidad a modificar no la tiene como equivalencia => se la agrega
                    equivalenciasAModificar.push({
                        _id : unidad._id,
                        proporcion : unidadAModificar.propEquivalente
                    });
                }
                else { 
                    //la unidad a modificar tiene equivalencias
                    //si la tiene se actualiza la proporción
                    //si no la tiene, se agrega  
                    let j = 0; //hay que definirla antes del for porque se la referencia después de éste                                     
                    for(j; j < equivalenciasAModificar.length; j++) { 
                        if (equivalenciasAModificar[j]._id.equals(unidad._id)) { //los _id son ObjectId
                            equivalenciasAModificar[j].proporcion = unidadAModificar.propEquivalente;
                            break;
                        }
                    }
                    if (j === equivalenciasAModificar.length) {//no la tiene
                        equivalenciasAModificar.push({
                            _id : unidad._id,
                            proporcion : unidadAModificar.propEquivalente
                        });
                    }
                }                
            }
            //Ahora resultadoUnidadesAModificar.unidadesAModificar queda (para el ejemplo propuesto):
            //[{_id: 1, nombre:'grs', equivalencias: [{_id: 3, proporcion: 0.001}], propEquivalente: 0.001},
            // {_id: 2, nombre: 'ss', equivalencias: [{_id: 3, proporcion: 0.02}], propEquivalente: 0.02}]
            //el atributo propEquivalente no se tiene en cuenta para guardar las modificaciones en la BD       
            return {        
                ...resultadoUnidadesAModificar,
                mensaje : constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE                
            }
        }
        else {
            return {...resultadoUnidadesAModificar, mensaje : constantesUnidades.UNIDAD_NULA};
        }        
    }
    else {
        return {...resultadoUnidadesAModificar, mensaje : constantesUnidades.ERROR_CONEXION};
    }    
}

//Dada una unidad, representada por _id, busca todas las unidades que la tengan como equivalencia
//Es un método auxiliar llamado por borrarUnidad() (por lo que no se exporta)
//_id: unidad a la cual se le buscan las unidades que la tengan como equivalencia
//devuelve un objeto de la forma
//{
//    mensaje : resultado de la operación (ERROR_LEER_UNIDADES || UNIDADES_LEIDAS_CORRECTAMENTE)
//    unidadesQueLaTienenComoEquivalencia : vector con las unidades que la tienen como equivalencia
//}
const obtenerUnidadesQueLaTienenComoEquivalencia = async (cliente, _id) => {
    const bd = cliente.db();

    let resultado = {
        mensaje : '',
        unidadesQueLaTienenComoEquivalencia : []
    }
    
    try {
        const prueba = await bd.collection('unidades').find().toArray();
        resultado.unidadesQueLaTienenComoEquivalencia = await bd.collection('unidades').find({"equivalencias._id" : _id}).toArray(); 
    }
    catch(error) {
        return {...resultado, mensaje : constantesUnidades.ERROR_LEER_UNIDADES};
    }

    return {...resultado, mensaje : constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE};
}

//Dado el vector de equivalencias, transforma los _id en ObjectId
export const transformarStringEnIdLasEquivalencias = (equivalencias) => {
    let equivalenciasUpdate = [];

    for(let i in equivalencias) 
        equivalenciasUpdate.push({...equivalencias[i], _id : new ObjectId(equivalencias[i]._id)});
    
    return equivalenciasUpdate;
}

//Agrega la unidad en la colección y actualiza sus equivalencias
//unidad a agregar
//mensaje : resultado de la operación (ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_UNIDADES || UNIDAD_REPETIDA || ERROR_GUARDAR_UNIDAD || UNIDAD_CREADA)
export const agregarUnidad = async (unidad) => {    
    //Para hacer el agregado:
        //1. Se verifica que no exista otra unidad con ese nombre (insensible a mayúsculas/minúsculas)
        //2. Se crea la unidad en la BD (en el proceso se obtiene el _id)
        //3. Se obtienen las unidades a modificar (son las equivalencias de unidad)
        //4. Se actualizan en la BD estas unidades a modificar

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        //1. Se verifica que no exista otra unidad con ese nombre (insensible a mayúsculas/minúsculas)
        const resultadoExisteUnidad = await existeUnidad(resultadoConectarBD.cliente, unidad.nombre);
        
        if (resultadoExisteUnidad === constantesUnidades.UNIDAD_NO_REPETIDA) { //no existe una unidad con ese nombre

            const bd = resultadoConectarBD.cliente.db();
            try {
                //2. Se crea la unidad en la BD (en el proceso se obtiene el _id)
                const resultadoInsertarUnidad = await bd.collection('unidades').insertOne(unidad);
                //cuando se está creando una unidad, no existe _id
                //una vez creada, se obtiene un _id, el cual se recupera en resultadoInsertarUnidad.insertedId

                //3. Se obtienen las unidades a modificar (son las equivalencias de unidad)
                if (unidad.equivalencias.length === 0) { //la unidad no tiene equivalencias
                    resultadoConectarBD.cliente.close();
                    return constantesUnidades.UNIDAD_CREADA;
                }
                else { //la unidad tiene equivalencias
                    const resultadoObtenerUnidadesAModificar = await obtenerUnidadesAModificar(resultadoConectarBD.cliente, {...unidad, _id : resultadoInsertarUnidad.insertedId});
                    //el tipo de resultadoInsertarUnidad.insertedId es ObjectId
                    if (resultadoObtenerUnidadesAModificar.mensaje !== constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE) {
                        resultadoConectarBD.cliente.close();
                        return resultadoObtenerUnidadesAModificar.mensaje
                    }

                    //4. Se actualizan en la BD estas unidades a modificar
                    for(let i in resultadoObtenerUnidadesAModificar.unidadesAModificar) {
                        const resultado = await actualizarEquivalencias(resultadoConectarBD.cliente, resultadoObtenerUnidadesAModificar.unidadesAModificar[i]);
                    }
                    resultadoConectarBD.cliente.close();
                    return constantesUnidades.UNIDAD_CREADA;
                }                
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return constantesUnidades.ERROR_GUARDAR_UNIDAD;
            }                
        }
        else {//ya existe una unidad con ese nombre o hubo algún error
            resultadoConectarBD.cliente.close();
            return resultadoExisteUnidad;
        }
    }
    else {
        return constantesUnidades.ERROR_CONEXION;
    }        
}

//Modifica la unidad en la colección y actualiza sus equivalencias
//unidad a modificar
//Devuelve el resultado de la operación: ERROR_CONEXION || ERROR_CREAR_INDICE || ERROR_LEER_UNIDADES || UNIDAD_REPETIDA || UNIDAD_NULA || ERROR_GUARDAR_UNIDAD || UNIDAD_MODIFICADA
export const modificarUnidad = async (unidad) => {    
    //Para hacer la modificación:
        //1. Se verifica que no exista otra unidad con ese nombre (insensible a mayúsculas/minúsculas)
        //2. Se obtienen (en memoria) las unidades que la tienen como equivalencia
        //3. Se borra (en memoria) la unidad de las unidades que la tienen como equivalencia
        //4. Se actualizan las unidades que la tienen como equivalencia en la BD
        //5. Se actualiza la unidad en la BD
        //6. Se actualizan en la BD las nuevas equivalencias

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();

        //1. Se verifica que no exista otra unidad con ese nombre (insensible a mayúsculas/minúsculas)
        const resultadoExisteUnidad = await existeUnidad(resultadoConectarBD.cliente, unidad.nombre, unidad._id);
        
        if (resultadoExisteUnidad === constantesUnidades.UNIDAD_NO_REPETIDA) { //no existe una unidad con ese nombre

            //2. Se obtienen (en memoria) las unidades que la tienen como equivalente
            const resultado = await obtenerUnidadesQueLaTienenComoEquivalencia(resultadoConectarBD.cliente, unidad._id);
            if (resultado.mensaje === constantesUnidades.ERROR_LEER_UNIDADES) {
                return resultado.mensaje;
            }        

            //3. Se borra (en memoria) la unidad de las unidades que la tienen como equivalencia
            for(let i in resultado.unidadesQueLaTienenComoEquivalencia) {
                const unidadUpdate = resultado.unidadesQueLaTienenComoEquivalencia[i];
                const equivalenciasUpdate = unidadUpdate.equivalencias.filter(u => !u._id.equals(unidad._id));
                unidadUpdate.equivalencias = equivalenciasUpdate;
            }
                    
            //resultadoConectarBD.cliente.close();
            //return constantesUnidades.UNIDAD_MODIFICADA;

            try {              
                //4. Se actualizan las unidades que la tienen como equivalencia en la BD
                for(let i in resultado.unidadesQueLaTienenComoEquivalencia) {
                    await actualizarEquivalencias(resultadoConectarBD.cliente, resultado.unidadesQueLaTienenComoEquivalencia[i]);
                }  
            
                //5. Se actualiza la unidad en la BD
                await bd.collection('unidades').updateOne({_id : unidad._id}, {
                    $set : {
                        nombre : unidad.nombre,
                        equivalencias : unidad.equivalencias
                    }
                }); 
                
                //6. Se actualizan en la BD las equivalencias
                if (unidad.equivalencias.length === 0) { //la unidad no tiene equivalencias
                    resultadoConectarBD.cliente.close();
                    return constantesUnidades.UNIDAD_MODIFICADA;
                }
                else { //la unidad sí tiene equivalencias
                    const resultadoObtenerUnidadesAModificar = await obtenerUnidadesAModificar(resultadoConectarBD.cliente, unidad);
                    if (resultadoObtenerUnidadesAModificar.mensaje !== constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE) {
                        resultadoConectarBD.cliente.close();
                        return resultadoObtenerUnidadesAModificar.mensaje
                    }
                    
                    for(let i in resultadoObtenerUnidadesAModificar.unidadesAModificar) {
                        await actualizarEquivalencias(resultadoConectarBD.cliente, resultadoObtenerUnidadesAModificar.unidadesAModificar[i]);
                    }
                    resultadoConectarBD.cliente.close();
                    return constantesUnidades.UNIDAD_MODIFICADA;
                }
            }
            catch(error) {
                resultadoConectarBD.cliente.close();
                return constantesUnidades.ERROR_ACTUALIZAR_UNIDAD;
            }
        }
        else {//ya existe una unidad con ese nombre o hubo algún error
            resultadoConectarBD.cliente.close();
            return resultadoExisteUnidad;
        }
    }
    else { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION;
    } 
}


//Busca en la BD la unidad con el _id especificado y le actualiza las equivalencias
//Es un método auxiliar que lo llama agregarUnidad(), modificarUnidad() y borrarUnidad() (por eso no se lo exporta)
//cliente: conexión a la BD
//unidad: unidad a la que se le actualizan las equivalencias
const actualizarEquivalencias = async (cliente, unidad) => {
    const bd = cliente.db();

    await bd.collection('unidades').updateOne({_id : unidad._id}, {
        $set : {equivalencias : unidad.equivalencias}
    });    
}

//Borra la unidad especificada
//unidad: unidad a borrar
//Devuelve el resultado de la operación: ERROR_CONEXION || ERROR_LEER_UNIDADES || INGREDIENTES_CON_LA_UNIDAD || ERROR_BORRAR_UNIDAD || UNIDAD_BORRADA
export const borrarUnidad = async (unidad) => {
    //Para hacer el borrado:
        //1. Se verifica que no haya un ingrediente con la misma
        //2. Se obtienen (en memoria) las unidades que la tienen como equivalente
        //3. Se borra (en memoria) la unidad de las unidades que la tienen como equivalencia
        //4. Se borra de la BD la unidad
        //5. Se actualizan en la BD las unidades que la tenían como equivalencia

    //Conexión a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesUnidades.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();

        //1. Se verifica que no haya un ingrediente con la misma
        const hayIngrededientesConEstaUnidad = await existeIngredienteConEstaUnidad(resultadoConectarBD.cliente, new ObjectId(unidad._id));
        if (hayIngrededientesConEstaUnidad !== constantesIngredientes.INGREDIENTES_SIN_LA_UNIDAD)
            return hayIngrededientesConEstaUnidad;

        //2. Se obtienen (en memoria) las unidades que la tienen como equivalente
        const resultado = await obtenerUnidadesQueLaTienenComoEquivalencia(resultadoConectarBD.cliente, new ObjectId(unidad._id));

        if (resultado.mensaje === constantesUnidades.ERROR_LEER_UNIDADES) {
            return resultado.mensaje;
        }

        //3. Se borra (en memoria) la unidad de las unidades que la tienen como equivalencia
        for(let i in resultado.unidadesQueLaTienenComoEquivalencia) {
            const unidadUpdate = resultado.unidadesQueLaTienenComoEquivalencia[i];
            const equivalenciasUpdate = unidadUpdate.equivalencias.filter(u => !u._id.equals(new ObjectId(unidad._id)));
            unidadUpdate.equivalencias = equivalenciasUpdate;
        }

        try {
            //4. Se borra de la BD la unidad
            await bd.collection('unidades').deleteOne({ "_id" : new ObjectId(unidad._id) });
    
            //5. Se actualizan en la BD las unidades que la tenían como equivalencia
            for(let i in resultado.unidadesQueLaTienenComoEquivalencia) {
                await actualizarEquivalencias(resultadoConectarBD.cliente, resultado.unidadesQueLaTienenComoEquivalencia[i]);
            }

            resultadoConectarBD.cliente.close();
            return constantesUnidades.UNIDAD_BORRADA;
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return constantesUnidades.ERROR_BORRAR_UNIDAD;
        }    
    }
    else { //no se pudo establecer la conexión
        return constantesUnidades.ERROR_CONEXION;
    }   
}