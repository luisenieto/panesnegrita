import { TableRow, TableCell, IconButton } from '@mui/material';
import { useSession } from 'next-auth/react';
//import PedidosDelCliente from './pedidosDelCliente';
import { useRouter } from 'next/router';
import axios from 'axios';
import { formatearFecha, moneda } from '../../auxiliares/auxiliares';
import { constantes, generarEstado, generarBotonAccion } from '../../auxiliares/auxiliaresPedidos';
import { RiEditLine } from 'react-icons/ri';
import { GoTrashcan } from 'react-icons/go';
import { GrLinkNext } from 'react-icons/gr';
import { GiPreviousButton } from 'react-icons/gi';
import { useContext } from 'react';
import { ProveedorContexto } from '../../contexto/proveedor';

const Fila = ({ unPedido, producto, setProducto, setearOpenPopup }) => {
    const router = useRouter();
    const { setPedidoACancelar } = useContext(ProveedorContexto);

    const { data: sesion, status: estaAveriguando } = useSession(); 
    //a data se le cambia el nombre por sesion, y a status por estaAveriguando
    //useSession() devuelve un objeto con 2 claves
        //data: objeto que describe la sesión actual, el cual puede tomar 3 valores:
            //undefined: cuando todavía no se obtuvo información de la sesión
            //null: cuando ya se obtuvo información de la sesión y la misma muestra que el usuario no está logueado
            //objeto Session: cuando ya se obtuvo información de la sesión y la misma muestra que el usuario sí está logueado
        //status: indica si NextJS está todavía averiguando si el usuario está logueado o no
            //es una enumeración que puede valer "loading", "authenticated" o "unauthenticated"

    //muestra los pedidos de un cliente
    // const mostrarPedidos = () => {
    //     if (!abierto) {
    //     }
    //     setAbierto(!abierto);  
    // }

    //permite borrar un cliente (si se está logueado)
    // const handleBorrar = () => {
    //     //Para poder borrar un cliente se debe estar logueado: sesion : <objeto> (si sesion ya vale algo
    //     //no hay necesidad de ver cuanto vale "estaAveriguando" porque ya terminó de averiguar)
    //     //Si sesion : null y estaAveriguando : "unauthenticated" hay que redirigir al formulario de logueo

    //     if (sesion) {
    //         //setIngredienteABorrar(unCliente);
    //         setearOpenPopup(true);
    //     }
    //     if (!sesion && estaAveriguando === "unauthenticated") {
    //         setRedirigirA('clientes'); 
    //         router.push('/autenticacion');
    //     }        
    // }

    //permite editar un cliente (si se está logueado)
    // const handleEditar = () => {                
    //     //Para poder editar un ingrediente se debe estar logueado: sesion : <objeto> (si sesion ya vale algo
    //     //no hay necesidad de ver cuanto vale "estaAveriguando" porque ya terminó de averiguar)
    //     //Si sesion : null y estaAveriguando : "unauthenticated" hay que redirigir al formulario de logueo

    //     if (sesion) {
    //         router.push(`/clientes/modificacion/${unCliente._id}`);
    //     }
    //     if (!sesion && estaAveriguando === "unauthenticated") {
    //         setRedirigirA('clientes'); 
    //         router.push('/autenticacion');
    //     }        
    // }    

    const handleEditar = () => {
        router.push(`/productos/pedidos/modificacion/${unPedido._id}`);
    }

    const handleCancelar = () => {
        setPedidoACancelar(unPedido);
        setearOpenPopup(true);
    }

    //Cambia el estado del pedido al estado anterior
    const handleEstadoAnterior = async () => {
        let pedidoUpdate;
        switch(unPedido.estado) {
            case constantes.ESTADO_ELABORACION :
                pedidoUpdate = {
                    ...unPedido, 
                    estado : constantes.ESTADO_PEDIDO
                };
                break;
            case constantes.ESTADO_TERMINADO :
                pedidoUpdate = {
                    ...unPedido,
                    estado : constantes.ESTADO_ELABORACION
                };
                break;
        }

        try {
            const ruta = '/api/pedidos/';
            const respuesta = await axios.post(ruta, {...pedidoUpdate, operacion : 'ME' });
            const data = await respuesta.data;
            if (data.mensaje === constantes.PEDIDO_MODIFICADO) {
                let pedidosUpdate = producto.pedidos;
                for(let i in pedidosUpdate) {
                    if (pedidosUpdate[i]._id === pedidoUpdate._id) {
                        pedidosUpdate[i] = pedidoUpdate;
                        break;
                    }
                }

                setProducto({
                    ...producto, 
                    pedidos : pedidosUpdate
                })
            }
        }
        catch(error) {
            console.log('Error!!!');
        }
    }

    //Cambia el estado del pedido al estado siguiente
    const handleEstadoSiguiente = async () => {
        let pedidoUpdate;
        switch(unPedido.estado) {
            case constantes.ESTADO_PEDIDO :
                pedidoUpdate = {
                    ...unPedido, 
                    estado : constantes.ESTADO_ELABORACION
                };
                break;
            case constantes.ESTADO_ELABORACION :
                pedidoUpdate = {
                    ...unPedido,
                    estado : constantes.ESTADO_TERMINADO
                };
                break;
            case constantes.ESTADO_TERMINADO :
                pedidoUpdate = {
                    ...unPedido,
                    estado : constantes.ESTADO_ENTREGADO
                };
                break;
        }

        try {
            const ruta = '/api/pedidos/';
            const respuesta = await axios.post(ruta, {...pedidoUpdate, operacion : 'ME' });
            const data = await respuesta.data;
            if (data.mensaje === constantes.PEDIDO_MODIFICADO) {
                let pedidosUpdate = producto.pedidos;
                if (pedidoUpdate.estado === constantes.ESTADO_ENTREGADO) {
                //si ya está como entregado, se lo saca del vector de pedidos del producto
                    const index = pedidosUpdate.indexOf(pedidoUpdate._id);
                    pedidosUpdate.splice(index, 1);
                }
                else { //si el estado está en cualquier otro estado, se lo actualiza
                    //pedidosUpdate = producto.pedidos;
                    for(let i in pedidosUpdate) {
                        if (pedidosUpdate[i]._id === pedidoUpdate._id) {
                            pedidosUpdate[i] = pedidoUpdate;
                            break;
                        }
                    }
                }
                setProducto({
                    ...producto, 
                    pedidos : pedidosUpdate
                })
            }
        }
        catch(error) {
            console.log('Error!!!');
        }
    }

    return (
        <TableRow 
            hover                            
            sx = {{'&:last-child td, &:last-child th': { border: 0 } }}
        >
            <TableCell sx = {{width : 5}}>                        
                <IconButton
                    size = 'small'
                    disabled = { unPedido.estado !== constantes.ESTADO_PEDIDO}
                    onClick = { handleEditar }
                >
                    <RiEditLine />
                </IconButton>                        
            </TableCell>  
            <TableCell sx = {{width : 5}}>
                <IconButton
                    size = 'small'
                    disabled = { unPedido.estado !== constantes.ESTADO_PEDIDO}
                    onClick = { handleCancelar }
                >
                    <GoTrashcan />
                </IconButton>
            </TableCell>
            <TableCell align = 'left' sx = {{maxWidth : 50}}>{`${unPedido.apellido}, ${unPedido.nombre}`}</TableCell>
            <TableCell align = 'center' sx = {{maxWidth : 20}}>{unPedido.cantidad}</TableCell>
            <TableCell align = 'center' sx = {{maxWidth : 30}}>{moneda(unPedido.importe)}</TableCell>
            <TableCell align = 'center' sx = {{maxWidth : 30}}>{formatearFecha(unPedido.fecha)}</TableCell> 
            <TableCell align = 'center' sx = {{maxWidth : 30}}>{generarEstado(unPedido.estado)}</TableCell>
            <TableCell sx = {{width : 5}}>                        
                <IconButton
                    size = 'small'
                    disabled = { unPedido.estado == constantes.ESTADO_PEDIDO }
                    onClick = { handleEstadoAnterior }
                >
                    <GiPreviousButton />
                </IconButton>                        
            </TableCell>  
            <TableCell sx = {{width : 5}}>
                <IconButton
                    size = 'small'
                    disabled = { unPedido.estado === constantes.ESTADO_ENTREGADO }
                    onClick = { handleEstadoSiguiente }
                >
                    {
                        generarBotonAccion(unPedido.estado)
                    }
                </IconButton>
            </TableCell>
        </TableRow>
    )
}

export default Fila;