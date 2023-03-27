const constantes = {
    ACEPTAR : 'Aceptar',
    APELLIDO : 'Apellido',
    APELLIDO_EN_BLANCO : 'El apellido del cliente no puede estar en blanco',  
    BORRAR_CLIENTE : 'Borrar cliente',
    CANCELAR : 'Cancelar',
    CLIENTE_BORRADO : 'Se borró el cliente',
    CLIENTE_MODIFICADO : 'Se modificó el cliente',
    CLIENTE_NULO : 'No se especificó un cliente',
    CLIENTE_CREADO : 'Se creó el cliente correctamente',
    CLIENTE_NO_REPETIDO : 'No existe un cliente con ese nombre, apellido y esa referencia',        
    CLIENTE_REPETIDO : 'Ya existe un cliente con ese nombre y esa referencia',        
    CLIENTES : 'Clientes',    
    CLIENTES_LEIDOS_CORRECTAMENTE: 'Clientes leidos correctamente',
    CLIENTES_POR_PAGINA: 'Clientes por página',
    CORREO : 'Correo',
    ERROR_ACTUALIZAR_CLIENTE : 'Error al actualizar el cliente',
    ERROR_BORRAR_CLIENTE : 'Error al borrar el cliente',
    ERROR_CREAR_INDICE : 'Error al crear los índices',
    ERROR_GUARDAR_CLIENTE : 'Error al guardar el cliente',
    ERROR_LEER_CLIENTES : 'Error al leer los clientes',    
    FECHA_NACIMIENTO : 'F. Nacimiento',
    MENSAJE_CONFIRMAR_BORRADO : '¿Confirma el borrado del cliente?',
    MODIFICACION_CLIENTE : 'Modificación de cliente',
    NOMBRE : 'Nombre',
    NOMBRE_EN_BLANCO : 'El nombre del cliente no puede estar en blanco',  
    NUEVO_CLIENTE : 'Nuevo Cliente',
    PEDIDOS : 'Pedidos',    
    REFERENCIA : 'Referencia',
    REFERENCIA_EN_BLANCO : 'La referencia no puede estar en blanco',  
    TELEFONO : 'Teléfono',   
    VERIFICACION_OK : 'Cliente con datos correctos'
}

export {    
    constantes
};

//Dada una cadena que representa un cliente de la forma "apellido, nombre (referencia)", 
//devuelve el idCliente correspondiente (como un String)
//Si no hay un cliente con esos datos, devuelve null
//Parámetros:
    //cadenaCliente: cadena que representa un cliente
    //clientes: vector de clientes
//Devuelve:
    //id del cliente (como String), o null
export const obtenerIdCliente = (cadenaCliente, clientes) => {
    for(let i in clientes) {
        if (cadenaCliente === clientes[i].apellido + ', ' + clientes[i].nombre + ' (' + clientes[i].referencia + ')')
            return clientes[i]._id;
    }
    return null;
}

//Dado el idCliente, devuelve una cadena de la forma "apellido, nombre (referencia)"
//Si no hay un cliente con el idCliente especificado, devuelve null
//Parámetros:
    //idCliente: id del cliente a buscar (como String)
    //clientes: vector de clientes
//Devuelve:
    //cadena de la forma "apellido, nombre (referencia)" (si se encuentra el cliente), o null
export const obtenerCadenaCliente = (idCliente, clientes) => {
    for(let i in clientes) {
        if (idCliente === clientes[i]._id)
            return clientes[i].apellido + ', ' + clientes[i].nombre + ' (' + clientes[i].referencia + ')';
    }
    return null;
}

