import numeral from 'numeral';

const constantes = {
    TITULO_APLICACION : 'Panes Negrita',
    // ERROR : 'Error',
    // ERROR_CONEXION : 'Error al conectar con la BD',
    // ERROR_COMPROBAR_UNIDAD : 'Error al comprobar si existe la unidad',
    //ERROR_GUARDAR_PRODUCTO : 'Error al guardar el producto',
    // ERROR_BORRAR_INGREDIENTE : 'Error al borrar el ingrediente',
    // ERROR_BUSCAR_UNIDAD : 'Error al buscar una unidad',
    ERROR_LEER_INGREDIENTES : 'Error al leer los ingrediemtes',
    ERROR_LEER_PRODUCTOS : 'Error al leer los productos',
    TIPO_INGREDIENTE_INGREDIENTE : 'Ingrediente',
    TIPO_INGREDIENTE_PRODUCTO : 'Producto',
    //ERROR_CREAR_INDICE : 'Error al crear los índices',
    //ERROR_ACTUALIZAR_PRODUCTO : 'Error al actualizar el producto',
    //INGREDIENTES : 'Ingredientes',
    //INGREDIENTE : 'Ingrediente',
    // INGREDIENTES_CON_LA_UNIDAD : 'No se puede borrar la unidad porque hay ingredientes con la misma',
    // CONEXION_EXITOSA : 'Conexión exitosa',
    //PRODUCTOS : 'Productos',
    // CLIENTES_POR_PAGINA: 'Clientes por página',
    INGREDIENTES_PRODUCTOS_LEIDOS_CORRECTAMENTE: 'Ingredientes y productos leidos correctamente',    
    // UNIDAD : 'Unidad',
    //NOMBRE : 'Nombre',
    //DESCRIPCION : 'Descripción',
    //PRECIO : 'Precio',
    // REFERENCIA : 'Referencia',
    // TELEFONO : 'Teléfono',
    // CORREO : 'Correo',
    // FECHA_NACIMIENTO : 'F. Nacimiento',
    //NOMBRE_EN_BLANCO : 'El nombre del producto no puede estar en blanco',  
    // REFERENCIA_EN_BLANCO : 'La referencia no puede estar en blanco',  
    //PRODUCTO_NULO : 'No se especificó un producto',
    // STOCK_INVALIDO : 'La cantidad en stock no puede ser negativa',    
    // STOCK_MINIMO_INVALIDO : 'La cantidad mínima en stock no puede ser negativa ni mayor a la cantidad en stock',    
    // UNIDAD_SIN_ESPECIFICAR : 'No se especificó una unidad para el ingrediente',    
    //PRODUCTO_REPETIDO : 'Ya existe un producto con ese nombre',        
    //PRODUCTO_NO_REPETIDO : 'No existe un producto con ese nombre',        
    //PRODUCTO_CREADO : 'Se creó el producto correctamente',
    //PEDIDO_CREADO : 'Se creó el pedido correctamente',
    //PRODUCTO_MODIFICADO : 'Se modificó el producto',
    // INGREDIENTE_BORRADO : 'Se borró el ingrediente',
    //NUEVO_PRODUCTO : 'Nuevo Producto',
    //NUEVO_PEDIDO : 'Nuevo Pedido',
    // SIN_IMAGEN : '/subidas/Sin_imagen.jpg',
    //MODIFICACION_PRODUCTO : 'Modificación de producto',
    // BORRAR_INGREDIENTE : 'Borrar ingrediente',
    //ACEPTAR : 'Aceptar',
    //CANCELAR : 'Cancelar',
    // FILTROS : 'Filtros',
    // FILTRO_TODOS : 'Todos',
    //PEDIDO : 'Nuevo pedido',    
    // FILTRO_SIN_PEDIDOS : 'Sin pedidos',
    // ORDENAR_POR : 'Ordenar Por:',
    // ORDENAR_POR_APELLIDO_ASC : 'Apellido [A - Z]',
    // ORDENAR_POR_APELLIDO_DESC : 'Apellido [Z - A]',
    // ORDENAR_POR_PEDIDOS_ASC : 'Pedidos asc',
    // ORDENAR_POR_PEDIDOS_DESC : 'Pedidos desc',
    // MENSAJE_CONFIRMAR_BORRADO : '¿Confirma el borrado del ingrediente?',
    //MENU_EDITAR : 'Editar',
    //MENU_BORRAR : 'Borrar',
    //MENU_VER_PEDIDOS : 'Ver pedidos',
}

export {    
    constantes
};

export const moneda = (numero) => {
    const formato = numero ? numeral(numero).format('$0,0.00') : '';
    return resultado(formato, '.00');
}

const resultado = (formato, clave = '.00') => {
    const isInteger = formato.includes(clave);
    return isInteger ? formato.replace(clave, '') : formato;
}