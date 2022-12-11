//Funciones auxiliares y constantes para el manejo de las unidades
//Todas estas funciones trabajan sobre el vector en memoria con las unidades

//dado un _id, devuelve su nombre
//Si no hay ninguna unidad con el _id especificado, devuelve INDEFINIDA
const obtenerNombreUnidad = (_id, unidades) => {
    for (let i in unidades) {
        if (unidades[i]._id === _id)
            return unidades[i].nombre
    }
    return constantes.INDEFINIDA;
}

//dado el nombre de una unidad, devuelve el _id
//si no se encuentra una unidad con el nombre especificado, o si el mismo es nulo, devuelve -1
const obtener_Id = (nombre, unidades) => {
    if (nombre && nombre.trim() !== '') {
        for (let i in unidades) {
            if (unidades[i].nombre.toLowerCase() === nombre.trim().toLowerCase())
                return unidades[i]._id;
        }
        return -1;
    }
    else
        return -1;
}

//dada una unidad, devuelve su posición dentro del vector
//devuelve -1 si no encuentra la unidad
//a este método lo usa obtenerUnidadesParaEquivalencia
const obtenerPosicion = (unidadReferencia, unidades) => {
    return unidades.findIndex(unidad => 
        unidad._id === unidadReferencia._id
    );
}

//dada una unidad, y sus equivalencias, devuelve el resto de unidades 
//para poder elegirlas como equivalencias
const obtenerUnidadesParaEquivalencia = (unidadReferencia, unidades) => {
    const restoUnidades = [];

    //primero se recorren todas las unidades y se toman las que tengan nombre distinto a unidadReferencia
    for (let i in unidades) {
        const unidad = unidades[i];
        if (unidadReferencia.nombre.trim() !== unidad.nombre) {
            restoUnidades.push({
                _id : unidad._id,
                nombre : unidad.nombre
            });
        }
    }

    //luego se toman las unidades de equivalencia que ya tiene unidadReferencia
    //y se las saca de restoUnidades si ya estuvieran
    const {equivalencias} = unidadReferencia;
    for(let i in equivalencias) {
        const unidad = equivalencias[i];
        const posicion = obtenerPosicion(unidad, restoUnidades);
        if (posicion !== -1) {
            restoUnidades.splice(posicion, 1);
        }
    }

    return restoUnidades;
}

//Dados el _id, el nombre de una unidad y la lista de unidades, devuelve true o false según exista otra unidad con el mismo nombre
//Se puede usar cuando se está creando una unidad (_id sin definir) o cuando se está modificando una unidad (_id definido)
//nombreUnidad: nombre de la unidad
//unidades: lista de unidades
//_id: sin definir cuando se está creando una unidad, definido cuando se está modificando una unidad
//a este método se lo usa para evitar unidades con el mismo nombre cuando se está modificando una unidad
const existeUnidad = (nombreUnidad, unidades, _id) => {    
    let posicion; 
    if (_id === undefined) { //creación de unidad
        posicion =  unidades.findIndex(unidad => 
            unidad.nombre.toLowerCase() === nombreUnidad.toLowerCase() 
        );
    }
    else { //modificación de unidad
        posicion =  unidades.findIndex(unidad => 
            unidad._id !== _id && unidad.nombre.toLowerCase() === nombreUnidad.toLowerCase() 
        );
    }
    return posicion !== -1 ? true : false;
}

//determina si la proporción es válida o no
//la proporción es válida sólo si es > 0
const esProporcionValida = (proporcion) => {
    if (proporcion === null)
        return false;
    else {
        return proporcion > 0 ? true : false;
    }
}


//Actualiza la equivalencia correspondiente
//Por ejemplo, se tiene la unidad "grs" (sin equivalencias) 
//y se crea la unidad "Kg" con la equivalencia de 1000 "grs"
//entones a la unidad "grs" se le agrega la equivalencia de 1/1000 "Kg"
//unidad: sería el objeto unidad correspondiente a la unidad "grs"
//_idUnidadEquivalente: sería el _id de "Kg"
const actualizarEquivalenciaCorrespondiente = (unidad, _idUnidadEquivalente) => {
    let equivalenciasUpdate = [...unidad.equivalencias];
    let posEquivalenciaAActualizar = -1;
    for(let i in unidad.equivalencias) {
        if (unidad.equivalencias[i]._id === _idUnidadEquivalente) {
            posEquivalenciaAActualizar = i;
            break;
        }
    }
    if (posEquivalenciaAActualizar !== -1) { //se encontró la equivalencia => actualizarla
        equivalenciasUpdate[posEquivalenciaAActualizar].proporcion = unidad.propEquivalente;
    }
    else { //no tiene esa equivalencia => agregarla
        equivalenciasUpdate.push({
            _id : _idUnidadEquivalente,
            proporcion : unidad.propEquivalente
        })
    }
    unidad.equivalencias = equivalenciasUpdate;
    return unidad;
}

const constantes = {
    TITULO_APLICACION : 'Panes Negrita',
    ERROR : 'Error',
    ERROR_CONEXION : 'Error al conectar con la BD',
    ERROR_COMPROBAR_UNIDAD : 'Error al comprobar si existe la unidad',
    ERROR_GUARDAR_UNIDAD : 'Error al guardar la unidad',
    ERROR_BORRAR_UNIDAD : 'Error al borrar la unidad',
    ERROR_BUSCAR_UNIDAD : 'Error al buscar una unidad',
    ERROR_LEER_UNIDADES : 'Error al leer las unidades',
    ERROR_CREAR_INDICE : 'Error al crear el índice',
    ERROR_ACTUALIZAR_UNIDAD : 'Error al actualizar una unidad',
    INDEFINIDA : 'indefinida',
    CONEXION_EXITOSA : 'Conexión exitosa',
    UNIDADES : 'Unidades',
    UNIDADES_POR_PAGINA: 'Unidades por página',
    UNIDADES_LEIDAS_CORRECTAMENTE: 'Unidades leidas correctamente',
    UNIDAD : 'Unidad',
    PROPORCION : 'Proporción',
    EQUIVALENCIAS : 'Equivalencias',
    UNIDAD_EN_BLANCO : 'El nombre de la unidad no puede estar en blanco',  
    UNIDAD_NULA : 'No se especificó una unidad',
    PROPORCION_INVALIDA : 'Al menos una de las proporciones es inválida',    
    UNIDAD_REPETIDA : 'Ya existe una unidad con ese nombre',        
    UNIDAD_NO_REPETIDA : 'No existe una unidad con ese nombre',        
    UNIDAD_CREADA : 'Se creó la unidad correctamente',
    UNIDAD_MODIFICADA : 'Se modificó la unidad',
    UNIDAD_BORRADA : 'Se borró la unidad',
    NUEVA_UNIDAD : 'Nueva Unidad',
    MODIFICACION_UNIDAD : 'Modificación de unidad',
    BORRAR_UNIDAD : 'Borrar unidad',
    ACEPTAR : 'Aceptar',
    CANCELAR : 'Cancelar',
    MENSAJE_CONFIRMAR_BORRADO : '¿Confirma el borrado de la unidad?'
}

export {
    obtenerNombreUnidad,
    obtener_Id,
    obtenerUnidadesParaEquivalencia,
    esProporcionValida,    
    existeUnidad,
    actualizarEquivalenciaCorrespondiente,
    constantes
};