const constantes = {
    ACEPTAR : 'Aceptar',
    AGREGAR_INGREDIENTE : 'Agregar ingrediente',
    BORRAR_INGREDIENTE : 'Borrar ingrediente',
    BORRAR_PRODUCTO : 'Borrar producto',
    CANCELAR : 'Cancelar',
    CANTIDAD_ERROR : 'Al menos un ingrediente tiene una cantidad incorrecta',
    DESCRIPCION : 'Descripción',
    ERROR: 'Error al analizar las unidades',
    ERROR_ACTUALIZAR_PRODUCTO : 'Error al actualizar el producto',
    ERROR_BORRAR_PRODUCTO : 'Error al borrar el producto',
    ERROR_CREAR_INDICE : 'Error al crear los índices',
    ERROR_GUARDAR_PRODUCTO : 'Error al guardar el producto',
    ERROR_LEER_PRODUCTOS : 'Error al leer los productos',
    FOTO_PREDETERMINADA : '/productos/foto-producto-predeterminado.png',    
    INGREDIENTE : 'Ingrediente',
    INGREDIENTE_UNIDAD_NULO : 'Al menos un ingrediente y/o una unidad no están especificados',
    INGREDIENTES : 'Ingredientes',
    MENSAJE_CONFIRMAR_BORRADO : '¿Confirma el borrado del producto?',
    MENU_EDITAR : 'Editar',
    MENU_BORRAR : 'Borrar',
    MENU_VER_PEDIDOS : 'Ver pedidos',
    MODIFICACION_PRODUCTO : 'Modificación de producto',
    MODIFICAR_INGREDIENTE : 'Modificar ingrediente',    
    NOMBRE : 'Nombre',
    NOMBRE_EN_BLANCO : 'El nombre del producto no puede estar en blanco',  
    NUEVO_PEDIDO : 'Nuevo Pedido',
    NUEVO_PRODUCTO : 'Nuevo Producto',
    PEDIDO : 'Nuevo pedido',    
    PEDIDO_CREADO : 'Se creó el pedido correctamente',    
    PRECIO : 'Precio',
    PRECIO_INCORRECTO : 'El precio es incorrecto',
    PRODUCTO_BORRADO : 'Se borró el producto',
    PRODUCTO_CREADO : 'Se creó el producto correctamente',
    PRODUCTO_MODIFICADO : 'Se modificó el producto',
    PRODUCTO_NO_REPETIDO : 'No existe un producto con ese nombre',        
    PRODUCTO_NULO : 'No se especificó un producto',
    PRODUCTO_REPETIDO : 'Ya existe un producto con ese nombre',        
    PRODUCTOS : 'Productos',
    PRODUCTOS_LEIDOS_CORRECTAMENTE : 'Productos leidos correctamente',  
    PRODUCTOS_CON_EL_INGREDIENTE : 'No se puede borrar el ingrediente porque hay productos que tienen el ingrediente especificado',    
    PRODUCTOS_CON_LA_UNIDAD : 'No se puede borrar la unidad porque hay productos cuyos ingredientes tienen la unidad especificada',    
    PRODUCTOS_SIN_EL_INGREDIENTE : 'No hay productos que tengan el ingrediente especificado',
    PRODUCTOS_SIN_LA_UNIDAD : 'No hay productos cuyos ingredientes tengan la unidad especificada',    
    RUTA_FOTOS_PRODUCTOS : '/productos/',
    UNIDAD : 'Unidad',   
    UNIDAD_SIN_EQUIVALENCIA : 'Al menos una unidad no tiene equivalencia',
    UNIDADES_CON_EQUIVALENCIAS : 'La unidades tienen equivalencias',   
    VERIFICACION_OK : 'Producto con datos correctos' 
}

export {    
    constantes
};


//Dada una cadena que representa un producto de la forma "nombre", 
//devuelve el idProducto correspondiente (como un String)
//Si no hay un producto con esos datos, devuelve null
//Parámetros:
    //cadenaProducto: cadena que representa un producto
    //productos: vector de productos
//Devuelve:
    //id del producto (como String), o null
export const obtenerIdProducto = (cadenaProducto, productos) => {
    for(let i in productos) {
        if (cadenaProducto === productos[i].nombre)
            return productos[i]._id;
    }
    return null;
}


//Dado el idProducto, devuelve una cadena de la forma "nombre"
//Si no hay un producto con el idProducto especificado, devuelve null
//Parámetros:
    //idProducto: id del producto a buscar (como String)
    //productos: vector de productos
//Devuelve:
    //cadena de la forma "nombre" (si se encuentra el producto), o null
export const obtenerCadenaProducto = (idProducto, productos) => {
    for(let i in productos) {
        if (idProducto === productos[i]._id)
            return productos[i].nombre;
    }
    return null;
}

//Dado el idProducto, devuelve el precio del mismo
//Si no hay un producto con el idProducto especificado, devuelve null
//Parámetros:
    //idProducto: id del producto a buscar (como String)
    //productos: vector de productos
//Devuelve:
    //precio del producto (si se encuentra el producto), o null
export const obtenerPrecio = (idProducto, productos) => {
    for(let i in productos) {
        if (idProducto === productos[i]._id)
            return productos[i].precio;
    }
    return null;
}

//Borra la foto elegida del vector
//Suponer que se selecciona el archivo "1" como imagen para el producto
//luego el archivo "2", luego el "3", luego el "2" nuevamente y finalmente el "1"
//El archivo de imágenes valdría: ["1", "2", "3", "2", "1"]
//Luego de llamar a esta función, el archivo valdría: ["2", "3", "2"]
//Este es el vector que se le pasará a la API encargada de borrar los archivos innecesarios
//cuando se cree el producto (no tiene que borrar el archivo "1" ya que es la foto que se eligió finalmente)
//Parámetros:
    //vector: vector con los archivos de fotos
    //foto: foto seleccionada
//Devuelve:
    //El vector sin la foto especificada    
export const borrarLaFotoElegida = (vector, foto) => {
    return vector.filter(item => item !== foto);
}

//Borra los elementos duplicados del vector
//Suponer que se selecciona el archivo "1" como imagen para el producto
//luego el archivo "2", luego el "3", luego el "2" nuevamente y finalmente el "1"
//El archivo de imágenes valdría: ["1", "2", "3", "2", "1"]
//Luego de llamar a esta función, el archivo valdría: ["1", "2", "3"]
//Este es el vector que se le pasará a la API encargada de borrar los archivos innecesarios
//cuando se cancele la operación
//Parámetros:
    //vector: vector con los archivos de fotos
//Devuelve:
    //vector con los archivos de fotos (sin duplicados)    
export const borrarDuplicados = (vector) => {
    return vector.filter((item, indice) => vector.indexOf(item) === indice);
}
