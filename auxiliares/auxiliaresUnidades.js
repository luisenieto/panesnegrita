//Funciones auxiliares y constantes para el manejo de las unidades
//Todas las funciones trabajan sobre el vector en memoria con las unidades

//dado un idUnidad, devuelve su nombre
const obtenerNombreUnidad = (idUnidad, unidades) => {
    for (let i in unidades) {
        if (unidades[i].idUnidad === idUnidad)
            return unidades[i].nombre
    }
    return 'indefinida';
}

//dado el nombre de una unidad, devuelve el idUnidad
//si no se encuentra una unidad con el nombre especificado, o si el mismo es nulo, devuelve -1
const obtenerIdUnidad = (nombre, unidades) => {
    if (nombre && nombre.trim() !== '') {
        for (let i in unidades) {
            if (unidades[i].nombre.toLowerCase() === nombre.trim().toLowerCase())
                return unidades[i].idUnidad;
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
        unidad.idUnidad === unidadReferencia.idUnidad
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
                idUnidad : unidad.idUnidad,
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

//Dados el idUnidad, el nombre de una unidad y la lista de unidades, devuelve true o false según exista otra unidad con el mismo nombre
//Se puede usar cuando se está creando una unidad (idUnidad sin definir) o cuando se está modificando una unidad (idUnidad definido)
//nombreUnidad: nombre de la unidad
//unidades: lista de unidades
//idUnidad: sin definir cuando se está creando una unidad, definido cuando se está modificando una unidad
//a este método se lo usa para evitar unidades con el mismo nombre cuando se está modificando una unidad
const existeUnidad = (nombreUnidad, unidades, idUnidad) => {    
    let posicion; 
    if (idUnidad === undefined) { //creación de unidad
        posicion =  unidades.findIndex(unidad => 
            unidad.nombre.toLowerCase() === nombreUnidad.toLowerCase() 
        );
    }
    else { //modificación de unidad
        posicion =  unidades.findIndex(unidad => 
            unidad.idUnidad !== idUnidad && unidad.nombre.toLowerCase() === nombreUnidad.toLowerCase() 
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

//dado un idUnidad, devuelve la unidad correspondiente
//si no encuentra la unidad para el idUnidad especificado, devuelve 'indefinida'
// const obtenerUnidad = (idUnidad, unidades) => {
//     const unidad = unidades.find(unidad => unidad.idUnidad === idUnidad);
//     return unidad === undefined ? 'indefinida' : unidad;    
// }

//Actualiza la equivalencia correspondiente
//Por ejemplo, se tiene la unidad "grs" (sin equivalencias) 
//y se crea la unidad "Kg" con la equivalencia de 1000 "grs"
//entones a la unidad "grs" se le agrega la equivalencia de 1/1000 "Kg"
//unidad: sería el objeto unidad correspondiente a la unidad "grs"
//idUnidadEquivalente: sería el idUnidad de "Kg"
const actualizarEquivalenciaCorrespondiente = (unidad, idUnidadEquivalente) => {
    let equivalenciasUpdate = [...unidad.equivalencias];
    let posEquivalenciaAActualizar = -1;
    for(let i in unidad.equivalencias) {
        if (unidad.equivalencias[i].idUnidad === idUnidadEquivalente) {
            posEquivalenciaAActualizar = i;
            break;
        }
    }
    if (posEquivalenciaAActualizar !== -1) { //se encontró la equivalencia => actualizarla
        equivalenciasUpdate[posEquivalenciaAActualizar].proporcion = unidad.propEquivalente;
    }
    else { //no tiene esa equivalencia => agregarla
        equivalenciasUpdate.push({
            idUnidad : idUnidadEquivalente,
            proporcion : unidad.propEquivalente
        })
    }
    unidad.equivalencias = equivalenciasUpdate;
    return unidad;
}



//obtiene todas las unidades
// const obtenerUnidades = async () => {
//     const ruta = '/api/unidades';
//     const respuesta = await axios.get('/api/unidades');
//     const unidades = await respuesta.data.unidades;

    // const unidades = [
    //     {
    //         idUnidad : 1,
    //         nombre : 'Kg',
    //         equivalencias : [
    //             {
    //                 idUnidad : 2,
    //                 proporcion : 1000
    //             },
    //             {
    //                 idUnidad : 3,
    //                 proporcion : 30
    //             }
    //         ]
    //     },
    //     {
    //         idUnidad : 2,
    //         nombre : 'grs',
    //         equivalencias : [
    //             {
    //                 idUnidad : 1,
    //                 proporcion : 0.001
    //             }
    //         ]
    //     },
    //     {
    //         idUnidad : 3,
    //         nombre : 'Cuchara 1/2 TBSP',
    //         equivalencias : [
    //             {
    //                 idUnidad : 2,
    //                 proporcion : 100
    //             },
    //             {
    //                 idUnidad : 4,
    //                 proporcion : 7.4
    //             },            
    //         ]
    //     },
    //     {
    //         idUnidad : 4,
    //         nombre : 'ml',
    //         equivalencias : [
    //             {
    //                 idUnidad : 3,
    //                 proporcion : 0.135
    //             }            
    //         ]
    //     }                            
    // ];

//     return unidades;
// }

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
    obtenerIdUnidad,
    obtenerUnidadesParaEquivalencia,
    esProporcionValida,    
    existeUnidad,
    actualizarEquivalenciaCorrespondiente,
    constantes
};