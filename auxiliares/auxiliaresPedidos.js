import Etiqueta from '../componentes/comunes/etiqueta';
import { CgPlayStopO } from 'react-icons/cg';
import { TbTruckDelivery } from 'react-icons/tb';
import { GiPressureCooker } from 'react-icons/gi';
import { GiCampfire } from 'react-icons/gi';


const constantes = {
    ACCION : 'Acción',
    ACEPTAR : 'Aceptar',
    CANCELAR : 'Cancelar',
    CANCELAR_PEDIDO : 'Cancelar pedido',
    CANTIDAD : 'Cantidad',
    CANTIDAD_INCORRECTA : 'La cantidad del producto es incorrecta',
    CLIENTE : 'Cliente',     
    CLIENTE_INEXISTENTE : 'El cliente especificado no existe',
    CLIENTE_SIN_ESPECIFICAR : 'No se especifó un cliente',
    CLIENTE_ACTUALIZADO : 'Cliente actualizado',
    ERROR_ACTUALIZAR_CLIENTE : 'Error al actualizar el cliente',
    ERROR_ACTUALIZAR_INGREDIENTES : 'Error al actualizar los ingredientes',
    ERROR_ACTUALIZAR_PEDIDO : 'Error al actualizar el pedido',
    ERROR_ACTUALIZAR_PRODUCTO : 'Error al actualizar el producto',
    ERROR_CANCELAR_PEDIDO : 'Error al cancelar el pedido',
    ERROR_CANCELAR_PEDIDO_POR_ESTADO : 'Error al cancelar el pedido debido al estado del mismo',
    ERROR_GUARDAR_PEDIDO : 'Error al guardar el pedido',
    ERROR_OBTENER_EQUIVALENCIA : 'Error al obtener la equivalencia',
    ERROR_LEER_CLIENTES_PRODUCTOS : 'Error al leer los clientes y/o productos', 
    ERROR_LEER_CLIENTES : 'Error al leer los clientes',  
    ERROR_LEER_INGREDIENTES : 'Error al leer los ingredientes',    
    ERROR_LEER_PEDIDOS : 'Error al leer los pedidos',   
    ERROR_LEER_PRODUCTOS : 'Error al leer los productos', 
    ESTADO : 'Estado',
    ESTADO_ELABORACION : 'En elaboración',
    ESTADO_ENTREGADO : 'Entregado',   
    ESTADO_PEDIDO : 'Pedido',
    ESTADO_TERMINADO : 'Terminado',
    FECHA : 'Fecha',
    IMPORTE : 'Importe',
    IMPORTE_INCORRECTO : 'El importe del pedido es incorrecto',
    INGREDIENTES_ACTUALIZADOS : 'Ingredientes actualizados',
    MENSAJE_CONFIRMAR_CANCELACION : '¿Confirma la cancelación del pedido?',
    MODIFICAR_PEDIDO : 'Modificar Pedido',
    NUEVO_PEDIDO : 'Nuevo Pedido',
    PEDIDO_CANCELADO : 'Se canceló el pedido',
    PEDIDO_CREADO : 'Se creó el pedido correctamente',    
    PEDIDO_EXISTENTE : 'Sí existe el pedido especificado',
    PEDIDO_INEXISTENTE : 'No existe el pedido especificado',
    PEDIDO_MODIFICADO : 'Se modificó el pedido',    
    PEDIDO_SIN_ESPECIFICAR : 'No se especificó un pedido',
    PEDIDOS_CON_EL_CLIENTE : 'No se puede borrar el cliente porque hay pedidos que tienen el cliente especificado',
    PEDIDOS_CON_EL_PRODUCTO : 'No se puede borrar el producto porque hay pedidos que tienen el producto especificado',
    PEDIDOS_LEIDOS_CORRECTAMENTE: 'Pedidos leidos correctamente',
    PEDIDOS_SIN_EL_CLIENTE : 'No hay pedidos que tengan el cliente especificado',
    PEDIDOS_SIN_EL_PRODUCTO : 'No hay pedidos que tengan el producto especificado',
    PEDIDOS_POR_PÁGINA : 'Pedidos por página',        
    PEDIDOS : 'Pedidos',
    PEDIDOS_MODIFICACION : 'Pedidos - Modificación',
    PEDIDOS_NUEVO : 'Pedidos - Nuevo',
    PRODUCTO : 'Producto',
    PRODUCTO_ACTUALIZADO : 'Producto actualizado',
    PRODUCTO_INEXISTENTE : 'El producto especificado no existe',
    PRODUCTO_SIN_ESPECIFICAR : 'No se especifó un producto',
    VERIFICACION_OK : 'Pedido con datos correctos',
    VOLVER : 'Volver',
}

//Genera la etiqueta que muestra el estado del pedido
const generarEstado = (estado) => {
    if (estado === constantes.ESTADO_PEDIDO) {
        return (
            <Etiqueta variant = "ghost" color = {'error'}>
                {constantes.ESTADO_PEDIDO}
            </Etiqueta>
        )
    }
    else if (estado === constantes.ESTADO_ELABORACION) {
        return (
            <Etiqueta variant = "ghost" color = {'warning'}>
                {constantes.ESTADO_ELABORACION}
            </Etiqueta>
        ) 
    }
    else {
        return (
            <Etiqueta variant = "ghost" color = {'success'}>
                {constantes.ESTADO_TERMINADO}
            </Etiqueta>
        )
    }
}

//Genera el botón de acción de un pedido según el estado el que se encuentre el mismo
const generarBotonAccion = (estado) => {
    switch(estado) {
        case constantes.ESTADO_PEDIDO : return (< GiCampfire/>)
        case constantes.ESTADO_ELABORACION : return (< CgPlayStopO/>)
        case constantes.ESTADO_TERMINADO : return (< TbTruckDelivery/>)
        default: return null;
    }
}


export {    
    constantes,
    generarEstado,
    generarBotonAccion
};

