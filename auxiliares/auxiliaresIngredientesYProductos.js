const constantes = {
    ERROR_LEER_INGREDIENTES : 'Error al leer los ingrediemtes',
    ERROR_LEER_PRODUCTOS : 'Error al leer los productos',
    INGREDIENTES_PRODUCTOS_LEIDOS_CORRECTAMENTE: 'Ingredientes y productos leidos correctamente',    
}

export {    
    constantes
};

//Dado el id de un ingrediente (ingrediente propiamente dicho o producto), devuelve su nombre
//Si no hay un ingrediente con el id especificado, devuelve null
//Parámetros:
    //idIngrediente: id del ingrediente a buscar
    //ingredientesYProductos: vector con todos los ingredientes y productos
//Devuelve:
    //nombre del ingrediente con el id especificado, o null si no se encuentra uno
export const obtenerNombreIngrediente = (idIngrediente, ingredientesYProductos) => {    
    for(let i in ingredientesYProductos) {
        if (idIngrediente === ingredientesYProductos[i].idIngrediente)
            return ingredientesYProductos[i].nombre;
    }
    return null;
}

//Dado el nombre de un ingrediente (ingrediente propiamente dicho o producto), devuelve su id
//Si no hay un ingrediente con el nombre especificado, devuelve null
//Parámetros:
    //nombreIngrediente: nombre del ingrediente a buscar
    //ingredientesYProductos: vector con todos los ingredientes y productos
//Devuelve:
    //id del ingrediente con el nombre especificado, o null si no se encuentra uno
export const obtenerIdIngrediente = (nombreIngrediente, ingredientesYProductos) => {
    for(let i in ingredientesYProductos) {
        if (nombreIngrediente === ingredientesYProductos[i].nombre)
            return ingredientesYProductos[i].idIngrediente;
    }
    return null;
}


//Determina si el ingrediente con el nombre especificado (ingrediente propiamente dicho o producto) 
//ya forma parte de los ingredientes del producto
//sirve para deshabilitar de la lista de ingredientes los que ya estén agregados
//Parámetros:
    //nombreIngredienteABuscar: nombre del ingrediente a buscar
    //ingredientes: vector con los ingredientes del producto
    //ingredientesYProductos: vector con todos los ingredientes y productos definidos
//Devuelve:
    //nombreIngredienteABuscar si el ingrediente que se busca ya  forma parte de los ingredientes del producto, o '' en caso contrario   
export const yaEstaEsteIngrediente = (nombreIngredienteABuscar, ingredientes, ingredientesYProductos) => {
    for(let i in ingredientes) {
        const nombreIngrediente = obtenerNombreIngrediente(ingredientes[i].idIngrediente, ingredientesYProductos)
        if (nombreIngrediente === nombreIngredienteABuscar)
            return nombreIngredienteABuscar;
    }
    return '';
}

