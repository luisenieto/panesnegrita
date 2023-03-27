//Funciones auxiliares y constantes para el manejo de las unidades
//Todas estas funciones trabajan sobre el vector en memoria con las unidades

//Dado un _id de unidad, devuelve su nombre
//Si no hay ninguna unidad con el _id especificado, devuelve constantes.INDEFINIDA
//Parámetros:
    //_id: _id de la unidad
    //unidades: vector de unidades
//Devuelve:
    //nombre de la unidad || constantes.INDEFINIDA
const obtenerNombreUnidad = (_id, unidades) => {
    for (let i in unidades) {
        if (unidades[i]._id === _id)
            return unidades[i].nombre
    }
    return constantes.INDEFINIDA;
}

//Dado el nombre de una unidad, devuelve el _id
//Si no se encuentra una unidad con el nombre especificado, o si el mismo es nulo, devuelve -1
//Parámetros:
    //nombre: nombre de la unidad
    //unidades: vector de unidades
//Devuelve:
    //_id de la unidad || -1
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

//Dada una unidad, devuelve su posición dentro del vector
//devuelve -1 si no encuentra la unidad
//a este método lo usa obtenerUnidadesParaEquivalencia
//Parámetros:
    //unidadReferencia: unidad a la cual se busca su posición dentro del vector
    //unidades: vector de unidades
//Devuelve:
    //posición dentro del vector de la unidad buscada    
const obtenerPosicion = (unidadReferencia, unidades) => {
    return unidades.findIndex(unidad => 
        unidad._id === unidadReferencia._id
    );
}

//Dada una unidad, y sus equivalencias, devuelve el resto de unidades 
//Sirve para poder elegirlas como equivalencias
//Para obtener el resto de unidades:
    //1. Se recorren todas las unidades y se toman las que tengan nombre distinto a unidadReferencia
    //2. Se toman las unidades de equivalencia que ya tiene unidadReferencia y se las saca de restoUnidades si ya estuvieran
//Requiere de las funciones auxiliares:
//  (2) obtenerPosicion()
//Parámetros:
    //unidadReferencia: unidad que se usa para buscar el resto de unidades
    //unidades: vector de unidades
//Devuelve: 
    //vector con todas las unidades salvo la unidad de referencia
const obtenerUnidadesParaEquivalencia = (unidadReferencia, unidades) => {
    const restoUnidades = [];

    //1. Se recorren todas las unidades y se toman las que tengan nombre distinto a unidadReferencia
    for (let i in unidades) {
        const unidad = unidades[i];
        if (unidadReferencia.nombre.trim() !== unidad.nombre) {
            restoUnidades.push({
                _id : unidad._id,
                nombre : unidad.nombre
            });
        }
    }

    //2. Se toman las unidades de equivalencia que ya tiene unidadReferencia y se las saca de restoUnidades si ya estuvieran
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
//A este método se lo usa para evitar unidades con el mismo nombre cuando se está modificando una unidad
//Parámetros:
    //nombreUnidad: nombre de la unidad
    //unidades: vector de unidades
    //_id: sin definir cuando se está creando una unidad, definido cuando se está modificando una unidad
//Devuelve:
    //true || false
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

//Determina si la proporción es válida o no
//La proporción es válida sólo si es > 0
//Parámetros
    //proporcion: proporción a analizar
//Devuelve:
    //true || false    
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
//Parámetros:
    //unidad: unidad a la cual se le actualiza la equivalencia correspondiente (sería la unidad "grs")
    //_idUnidadEquivalente: id de la unidad equivalente (sería el _id de "Kg")
//Devuelve:
    //unidad con la equivalencia actualizada    
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
    ACEPTAR : 'Aceptar',
    BORRAR_UNIDAD : 'Borrar unidad',
    CANCELAR : 'Cancelar',
    ERROR_ACTUALIZAR_UNIDAD : 'Error al actualizar una unidad',
    ERROR_BUSCAR_UNIDAD : 'Error al buscar una unidad',
    ERROR_BORRAR_UNIDAD : 'Error al borrar la unidad',
    ERROR_COMPROBAR_UNIDAD : 'Error al comprobar si existe la unidad',
    ERROR_CREAR_INDICE : 'Error al crear el índice',
    ERROR_GUARDAR_UNIDAD : 'Error al guardar la unidad',    
    ERROR_LEER_UNIDADES : 'Error al leer las unidades',
    EQUIVALENCIAS : 'Equivalencias',
    INDEFINIDA : 'indefinida',
    MENSAJE_CONFIRMAR_BORRADO : '¿Confirma el borrado de la unidad?',
    MODIFICACION_UNIDAD : 'Modificación de unidad',
    NUEVA_EQUIVALENCIA : 'Nueva equivalencia', 
    NUEVA_UNIDAD : 'Nueva Unidad',
    PROPORCION : 'Proporción',
    PROPORCION_INVALIDA : 'Al menos una de las proporciones es inválida',  
    UNIDAD : 'Unidad',
    UNIDAD_BORRADA : 'Se borró la unidad',
    UNIDAD_CREADA : 'Se creó la unidad correctamente',
    UNIDAD_EN_BLANCO : 'El nombre de la unidad no puede estar en blanco', 
    UNIDAD_MODIFICADA : 'Se modificó la unidad',
    UNIDAD_NULA : 'No se especificó una unidad',
    UNIDADES : 'Unidades',
    UNIDADES_LEIDAS_CORRECTAMENTE: 'Unidades leidas correctamente',
    UNIDAD_NO_REPETIDA : 'No existe una unidad con ese nombre',   
    UNIDADES_POR_PAGINA: 'Unidades por página',    
    UNIDAD_REPETIDA : 'Ya existe una unidad con ese nombre', 
    VERIFICACION_OK : 'Unidad con datos correctos'     
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