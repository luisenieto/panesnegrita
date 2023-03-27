import { ObjectId } from 'mongodb';
import { constantes as constantesUnidades } from '../../../auxiliares/auxiliaresUnidades';
import { constantes as constantesIngredientes } from '../../../auxiliares/auxiliaresIngredientes';
import { constantes as constantesProductos } from '../../../auxiliares/auxiliaresProductos';
import { existeIngredienteConEstaUnidad } from '../ingredientes/bdAuxiliares';
import { conectarBD } from '../conexion/conexion';
import { constantes as constantesConexion } from '../../../auxiliares/auxiliaresConexion';
import { esProporcionValida } from '../../../auxiliares/auxiliaresUnidades';
import { existeProductoConEstaUnidad } from '../productos/bdAuxiliares';

//*************************** Funciones de ABM y Listado ************************* */

//Agrega la unidad en la colección y actualiza sus equivalencias
//Para hacer el agregado:
    //1. Verifica que el nombre de la unidad no esté en blanco y que las equivalencias tengan una proporción válida
    //2. Se conecta a la BD    
    //3. Verifica que no exista otra unidad con ese nombre (insensible a mayúsculas/minúsculas)
    //4. Crea la unidad en la BD (en el proceso se obtiene el _id)
    //5. Obtiene las unidades a modificar (son las equivalencias de unidad)
    //6. Actualiza en la BD estas unidades a modificar
//Requiere de las funciones auxiliares:
    //(1) verificarUnidad()
    //(2) conectarBD()
    //(3) existeUnidad()
    //(5) obtenerUnidadesAModificar()
    //(6) actualizarEquivalencias()
//Parámetros:
    //unidad a agregar
//Devuelve:
    //constantesUnidades.UNIDAD_EN_BLANCO ||
    //constantesUnidades.PROPORCION_INVALIDA ||
    //constantesConexion.ERROR_CONEXION ||
    //constantesUnidades.ERROR_CREAR_INDICE ||
    //constantesUnidades.ERROR_LEER_UNIDADES ||
    //constantesUnidades.UNIDAD_REPETIDA ||
    //constantesUnidades.ERROR_GUARDAR_UNIDAD ||
    //constantesUnidades.UNIDAD_CREADA ||
export const agregarUnidad = async (unidad) => {    
    //1. Verifica que el nombre de la unidad no esté en blanco y que las equivalencias tengan una proporción válida
    const resultadoVerificacion = verificarUnidad(unidad.nombre, unidad.equivalencias);
    
    if (resultadoVerificacion === constantesUnidades.VERIFICACION_OK) {
    
        //2. Se conecta a la BD
        const resultadoConectarBD = await conectarBD();

        if (resultadoConectarBD.mensaje === constantesConexion.CONEXION_EXITOSA) { //se pudo establecer la conexión
            //3. Verifica que no exista otra unidad con ese nombre (insensible a mayúsculas/minúsculas)
            const resultadoExisteUnidad = await existeUnidad(resultadoConectarBD.cliente, unidad.nombre);
            
            if (resultadoExisteUnidad === constantesUnidades.UNIDAD_NO_REPETIDA) { //no existe una unidad con ese nombre

                const bd = resultadoConectarBD.cliente.db();
                try {
                    //4. Crea la unidad en la BD (en el proceso se obtiene el _id)
                    const resultadoInsertarUnidad = await bd.collection('unidades').insertOne(unidad);
                    //cuando se está creando una unidad, no existe _id
                    //una vez creada, se obtiene un _id, el cual se recupera en resultadoInsertarUnidad.insertedId

                    //5. Obtiene las unidades a modificar (son las equivalencias de unidad)
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

                        //6. Actualiza en la BD estas unidades a modificar
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
        else { //error de conexión
            return resultadoConectarBD.mensaje;
        }        
    }
    else //error en el nombre o equivalencias de la unidad
        return resultadoVerificacion;
}

//Borra la unidad especificada
//Para hacer el borrado:
    //1. Se conecta a la BD
    //2. Verifica que no haya un ingrediente con la misma
    //3. Verifica que no haya productos cuyos ingredientes la tangan (FALTA)
    //4. Obtiene (en memoria) las unidades que la tienen como equivalente
    //5. Borra (en memoria) la unidad de las unidades que la tienen como equivalencia
    //6. Borra de la BD la unidad
    //7. Actualizan en la BD las unidades que la tenían como equivalencia
//Requiere de las funciones auxiliares:
    //(1) conectarBD()
    //(2) existeIngredienteConEstaUnidad()
    //(3) existeProductoConEstaUnidad() (FALTA)
    //(4) obtenerUnidadesQueLaTienenComoEquivalencia()
//Parámetros:
    //unidad: unidad a borrar
//Devuelve:
    //constantesConexion.ERROR_CONEXION || 
    //constantesUnidades.ERROR_LEER_UNIDADES || 
    //constantesIngredientes.INGREDIENTES_CON_LA_UNIDAD || 
    //constantesProductos.PRODUCTOS_CON_LA_UNIDAD ||
    //constantesUnidades.ERROR_BORRAR_UNIDAD || 
    //constantesUnidades.UNIDAD_BORRADA
export const borrarUnidad = async (unidad) => {

    //1. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    if (resultadoConectarBD.mensaje === constantesConexion.CONEXION_EXITOSA) { //se pudo establecer la conexión
        const bd = resultadoConectarBD.cliente.db();

        //2. Verifica que no haya un ingrediente con la misma
        const hayIngrededientesConEstaUnidad = await existeIngredienteConEstaUnidad(resultadoConectarBD.cliente, new ObjectId(unidad._id));
        
        if (hayIngrededientesConEstaUnidad !== constantesIngredientes.INGREDIENTES_SIN_LA_UNIDAD) {
            resultadoConectarBD.cliente.close();
            return hayIngrededientesConEstaUnidad;
        }

        //3. Verifica que no haya productos cuyos ingredientes la tangan (FALTA)
        const hayProductosConEstaUnidad = await existeProductoConEstaUnidad(resultadoConectarBD.cliente, new ObjectId(unidad._id));

        if (hayProductosConEstaUnidad === constantesProductos.PRODUCTOS_CON_LA_UNIDAD) {
            resultadoConectarBD.cliente.close();
            return hayProductosConEstaUnidad;
        }

        //4. Otiene (en memoria) las unidades que la tienen como equivalente
        const resultado = await obtenerUnidadesQueLaTienenComoEquivalencia(resultadoConectarBD.cliente, new ObjectId(unidad._id));

        if (resultado.mensaje === constantesUnidades.ERROR_LEER_UNIDADES) {
            resultadoConectarBD.cliente.close();
            return resultado.mensaje;
        }            

        //5. Borra (en memoria) la unidad de las unidades que la tienen como equivalencia
        for(let i in resultado.unidadesQueLaTienenComoEquivalencia) {
            const unidadUpdate = resultado.unidadesQueLaTienenComoEquivalencia[i];
            const equivalenciasUpdate = unidadUpdate.equivalencias.filter(u => !u._id.equals(new ObjectId(unidad._id)));
            unidadUpdate.equivalencias = equivalenciasUpdate;
        }

        try {
            //6. Borra de la BD la unidad
            await bd.collection('unidades').deleteOne({ "_id" : new ObjectId(unidad._id) });
    
            //7. Actualiza en la BD las unidades que la tenían como equivalencia
            for(let i in resultado.unidadesQueLaTienenComoEquivalencia) 
                await actualizarEquivalencias(resultadoConectarBD.cliente, resultado.unidadesQueLaTienenComoEquivalencia[i]);

            resultadoConectarBD.cliente.close();
            return constantesUnidades.UNIDAD_BORRADA;
        }
        catch(error) {
            resultadoConectarBD.cliente.close();
            return constantesUnidades.ERROR_BORRAR_UNIDAD;
        }    
    }
    else { //no se pudo establecer la conexión
        return resultadoConectarBD.mensaje;
    }   
}

//Modifica la unidad en la colección y actualiza sus equivalencias
//Para hacer la modificación:
    //1. Verifica que el nombre de la unidad no esté en blanco y que las equivalencias tengan una proporción válida
    //2. Se conecta a la BD
    //3. Verifica que no exista otra unidad con ese nombre (insensible a mayúsculas/minúsculas)
    //4. Obtiene (en memoria) las unidades que la tienen como equivalencia
    //5. Borra (en memoria) la unidad de las unidades que la tienen como equivalencia
    //6. Actualiza las unidades que la tienen como equivalencia en la BD
    //7. Actualiza la unidad en la BD
    //8. Actualiza en la BD las nuevas equivalencias
//Requiere de las funciones auxiliares:
    //(1) verificarUnidad()
    //(2) conectarBD()    
    //(3) existeUnidad()
    //(4) obtenerUnidadesAModificar()
    //(8) actualizarEquivalencias()
//Parámetros:
    //unidad: unidad a modificar
//Devuelve:
    //constantesUnidades.UNIDAD_EN_BLANCO ||
    //constantesUnidades.PROPORCION_INVALIDA ||
    //constantesConexion.ERROR_CONEXION || 
    //constantesUnidades.ERROR_CREAR_INDICE || 
    //constantesUnidades.ERROR_LEER_UNIDADES || 
    //constantesUnidades.UNIDAD_REPETIDA || 
    //constantesUnidades.UNIDAD_NULA || 
    //constantesUnidades.ERROR_GUARDAR_UNIDAD || 
    //constantesUnidades.UNIDAD_MODIFICADA
export const modificarUnidad = async (unidad) => {    
    //1. Verifica que el nombre de la unidad no esté en blanco y que las equivalencias tengan una proporción válida
    const resultadoVerificacion = verificarUnidad(unidad.nombre, unidad.equivalencias);

    if (resultadoVerificacion === constantesUnidades.VERIFICACION_OK) {
    
        //2. Se conecta a la BD
        const resultadoConectarBD = await conectarBD();

        if (resultadoConectarBD.mensaje === constantesConexion.CONEXION_EXITOSA) { //se pudo establecer la conexión
            const bd = resultadoConectarBD.cliente.db();

            //3. Verifica que no exista otra unidad con ese nombre (insensible a mayúsculas/minúsculas)
            const resultadoExisteUnidad = await existeUnidad(resultadoConectarBD.cliente, unidad.nombre, unidad._id);
            
            if (resultadoExisteUnidad === constantesUnidades.UNIDAD_NO_REPETIDA) { //no existe una unidad con ese nombre

                //4. Obtiene (en memoria) las unidades que la tienen como equivalente
                const resultado = await obtenerUnidadesQueLaTienenComoEquivalencia(resultadoConectarBD.cliente, unidad._id);
                if (resultado.mensaje === constantesUnidades.ERROR_LEER_UNIDADES) {
                    return resultado.mensaje;
                }        

                //5. Borra (en memoria) la unidad de las unidades que la tienen como equivalencia
                for(let i in resultado.unidadesQueLaTienenComoEquivalencia) {
                    const unidadUpdate = resultado.unidadesQueLaTienenComoEquivalencia[i];
                    const equivalenciasUpdate = unidadUpdate.equivalencias.filter(u => !u._id.equals(unidad._id));
                    unidadUpdate.equivalencias = equivalenciasUpdate;
                }
                        
                try {              
                    //6. Actualiza las unidades que la tienen como equivalencia en la BD
                    for(let i in resultado.unidadesQueLaTienenComoEquivalencia) {
                        await actualizarEquivalencias(resultadoConectarBD.cliente, resultado.unidadesQueLaTienenComoEquivalencia[i]);
                    }  
                
                    //7. Actualiza la unidad en la BD
                    await bd.collection('unidades').updateOne({_id : unidad._id}, {
                        $set : {
                            nombre : unidad.nombre,
                            equivalencias : unidad.equivalencias
                        }
                    }); 
                    
                    //8. Actualiza en la BD las equivalencias
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
                        
                        for(let i in resultadoObtenerUnidadesAModificar.unidadesAModificar)
                            await actualizarEquivalencias(resultadoConectarBD.cliente, resultadoObtenerUnidadesAModificar.unidadesAModificar[i]);

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
            return resultadoConectarBD.mensaje;
        } 
    }
    else //error en el nombre o equivalencias de la unidad
        return resultadoVerificacion;
}

//Obtiene todas las unidades, ordenadas alfabéticamente
//Para obtener las unidades:
    //1. Se conecta a la BD
    //2. Obtiene las unidades
//Requiere de las funciones auxiliares:
    //(1) conectarBD()
//Devuelve:
    //{
    //    mensaje : constantesConexion.ERROR_CONEXION || constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE || constantesUnidades.ERROR_LEER_UNIDADES
    //    unidades : vector con las unidades leidas (si hubo error está vacío)
    //}
export const obtenerUnidades = async () => {      
    //1. Se conecta a la BD
    const resultadoConectarBD = await conectarBD();

    let resultadoObtenerUnidades = {
        mensaje : '',
        unidades : []
    }

    if (resultadoConectarBD.mensaje === constantesConexion.CONEXION_EXITOSA) { //se pudo establecer la conexión
        //2. Obtiene las unidades
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
        return {...resultadoObtenerUnidades, mensaje : resultadoConectarBD.mensaje};
    }
}

//Obtiene la unidad con el _id especificado
//También devuelve la lista de unidades
//Para obtener la unidad:
    //1. Se conecta a la BD
    //2. Obtiene la unidad para el _id especificado
//Requiere de las funciones auxiliares:
    //(1) conectarBD()    
//Parámetros
    //_id: _id a buscar
//Devuelve:
    //{
    //    mensaje : constantesConexion.ERROR_CONEXION || constantesUnidades.UNIDAD_NULA || constantesUnidades.ERROR_LEER_UNIDADES || constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE
    //    unidad : unidad con el _id especificado, o null si no se encuentra una
    //    unidades : lista de unidades (si hubo error está vacía)
    //}
export const obtenerUnidadParaModificar = async (_id) => {
    let resultadoObtenerUnidad = {
        mensaje : '',
        unidad : null,
        unidades : []
    }

    if (_id) { //se especificó un _id
        //1. Se conecta a la BD
        const resultadoConectarBD = await conectarBD();

        if (resultadoConectarBD.mensaje === constantesConexion.CONEXION_EXITOSA) { //se pudo establecer la conexión
            //2. Obtiene la unidad para el _id especificado
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
        else { //no se pudo establecer la conexión
            return {...resultadoObtenerUnidad, mensaje : resultadoConectarBD.mensaje};
        }
    }
    else { //no se especificó un _id
        return {...resultadoObtenerUnidad, mensaje : constantesUnidades.UNIDAD_NULA};
    }
}


//*************************** Funciones auxiliares ************************* */

//Busca en la BD la unidad con el _id especificado y le actualiza las equivalencias
//Es un método auxiliar que lo llama agregarUnidad(), modificarUnidad() y borrarUnidad() (por eso no se lo exporta)
//Parámetros:
    //cliente: conexión a la BD
    //unidad: unidad a la que se le actualizan las equivalencias
const actualizarEquivalencias = async (cliente, unidad) => {
    const bd = cliente.db();

    await bd.collection('unidades').updateOne({_id : unidad._id}, {
        $set : {equivalencias : unidad.equivalencias}
    });    
}
    
//Verifica si existe una unidad con el nombre especificado
//Es un método auxiliar que lo llama agregarUnidad() y modificarUnidad() (por eso no se lo exporta)
//Se puede usar cuando se está creando una unidad (_id sin definir) o cuando se está modificando una unidad (_id definido)
//para eso hace una búsqueda insensible a mayúsculas/minúscuulas
//para lo cual crea un índice (sólo en caso de no existir) en la colección 'unidades' que permite hacer estas búsquedas
//El índice se crea sobre el atributo 'nombre', en orden ascendente (1),
//utiliza el idioma español ('es') y es insensible a mayúsculas/minúsculas (2)
//Una vez definido el índice, para que el mismo se use, se lo debe especificar tal cual al momento de hacer la búsqueda
//Parámetros:
    //cliente: conexión a la BD
    //nombreUnidad: nombre de la unidad
    //_id: sin definir cuando se está creando una unidad, definido cuando se está modificando una unidad
//Devuelve:
    //constantesConexion.ERROR_CONEXION || 
    //contantesUnidades.ERROR_CREAR_INDICE || 
    //contantesUnidades.ERROR_LEER_UNIDADES || 
    //contantesUnidades.UNIDAD_REPETIDA || 
    //contantesUnidades.UNIDAD_NO_REPETIDA
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
        return constantesConexion.ERROR_CONEXION;
    }           
}

//Obtiene la unidad con el _id especificado
//Es un método auxiliar que utiliza obtenerUnidadesAModificar(), por eso no se lo exporta
//Parámetros:
    //cliente: conexión a la BD
    //_id: _id a buscar
//Devuelve:
    //{
    //    mensaje : constantesConexion.ERROR_CONEXION || constantesUnidades.UNIDAD_NULA || constantesUnidades.ERROR_LEER_UNIDADES || constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE)
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
        return {...resultadoObtenerUnidad, mensaje : constantesConexion.ERROR_CONEXION};
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
//Requiere de las funciones auxiliares:
    //obtenerUnidad()
//Parámetros:
    //cliente: conexión a la BD
    //unidad: siguiendo el ejemplo, valdría {_id: 3, nombre: 'Kg', equivalencias: [{_id: 1, proporcion: 1000}, {_id: 2, proporcion: 50}]}
//Devuelve:
    //{
    //    mensaje : constantesConexion.ERROR_CONEXION || constantesUnidades.UNIDAD_NULA || constantesUnidades.ERROR_LEER_UNIDADES || constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE
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
        return {...resultadoUnidadesAModificar, mensaje : constantesConexion.ERROR_CONEXION};
    }    
}

//Dada una unidad, representada por _id, busca todas las unidades que la tengan como equivalencia
//Es un método auxiliar llamado por borrarUnidad() (por lo que no se exporta)
//Parámetros:
    //cliente: conexión a la BD
    //_id: id de la unidad a la cual se le buscan las unidades que la tengan como equivalencia
//Devuelve:
    //{
    //    mensaje : constantesUnidades.ERROR_LEER_UNIDADES || constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE
    //    unidadesQueLaTienenComoEquivalencia : vector con las unidades que la tienen como equivalencia
    //}
const obtenerUnidadesQueLaTienenComoEquivalencia = async (cliente, _id) => {
    const bd = cliente.db();

    let resultado = {
        mensaje : '',
        unidadesQueLaTienenComoEquivalencia : []
    }
    
    try {
        //const prueba = await bd.collection('unidades').find().toArray();
        resultado.unidadesQueLaTienenComoEquivalencia = await bd.collection('unidades').find({"equivalencias._id" : _id}).toArray(); 
    }
    catch(error) {
        return {...resultado, mensaje : constantesUnidades.ERROR_LEER_UNIDADES};
    }

    return {...resultado, mensaje : constantesUnidades.UNIDADES_LEIDAS_CORRECTAMENTE};
}

//Dado el vector de equivalencias, transforma los _id en ObjectId
//Parámetros:
    //equivalencias: vector de equivalencias con los _id como string
//Devuelve:
    //vector de equivalencias con los _id transformados a ObjectId    
export const transformarStringEnIdLasEquivalencias = (equivalencias) => {
    let equivalenciasUpdate = [];

    for(let i in equivalencias) 
        equivalenciasUpdate.push({...equivalencias[i], _id : new ObjectId(equivalencias[i]._id)});
    
    return equivalenciasUpdate;
}


//Verifica que:
    //1. El nombre de la unidad no esté en blanco
    //2. Que las equivalencias tengan una proporción válida
//Parámetros:
    //nombre: nombre de la unidad
    //equivalencias: equivalencias de la unidad
//Devuelve:
    //constantesUnidades.UNIDAD_EN_BLANCO ||
    //constantesUnidades.PROPORCION_INVALIDA ||
    //constantesUnidades.VERIFICACION_OK
const verificarUnidad = ( nombre, equivalencias ) => {

    //1. Verifica que el nombre de la unidad no esté en blanco
    if (nombre === '') {
        return constantesUnidades.UNIDAD_EN_BLANCO;
    }

    //2. Por cada equivalencia se verifica que la proporción sea válida
    for(let i in equivalencias) {
        if (!esProporcionValida(equivalencias[i].proporcion)) {
            return constantesUnidades.PROPORCION_INVALIDA;
        }
    } 

    return constantesUnidades.VERIFICACION_OK;
}

    

