import { TableRow, TableCell, IconButton } from '@mui/material';
import { moneda, formatearFecha } from '../../auxiliares/auxiliares';
import { generarEstado } from '../../auxiliares/auxiliaresPedidos';
import { RiEditLine } from 'react-icons/ri';
import { GoTrashcan } from 'react-icons/go';
import { GiPreviousButton } from 'react-icons/gi';
import { GiNextButton } from 'react-icons/gi';
import { constantes } from '../../auxiliares/auxiliaresPedidos';
import { useRouter } from 'next/router';
import { ProveedorContexto } from '../../contexto/proveedor';
import { useContext } from 'react';
import axios from 'axios';

const FilaPedidos = ({ unPedido, cliente, setCliente, setearOpenPopup }) => {
    const router = useRouter();
    const { setPedidoACancelar } = useContext(ProveedorContexto);

    const handleEditar = () => {
        console.log('handleEditar');
        router.push(`/clientes/pedidos/modificacion/${unPedido._id}`);
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
                let pedidosUpdate = cliente.pedidos;
                for(let i in pedidosUpdate) {
                    if (pedidosUpdate[i]._id === pedidoUpdate._id) {
                        pedidosUpdate[i] = pedidoUpdate;
                        break;
                    }
                }

                setCliente({
                    ...cliente, 
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
                let pedidosUpdate = cliente.pedidos;
                if (pedidoUpdate.estado === constantes.ESTADO_ENTREGADO) {
                //si ya está como entregado, se lo saca del vector de pedidos del cliente
                    const index = pedidosUpdate.indexOf(pedidoUpdate._id);
                    pedidosUpdate.splice(index, 1);
                }
                else { //si el estado está en cualquier otro estado, se lo actualiza
                    for(let i in pedidosUpdate) {
                        if (pedidosUpdate[i]._id === pedidoUpdate._id) {
                            pedidosUpdate[i] = pedidoUpdate;
                            break;
                        }
                    }
                }
                setCliente({
                    ...cliente, 
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
            <TableCell align = 'left' sx = {{maxWidth : 50}}>{unPedido.nombre}</TableCell>
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
                    <GiNextButton />
                </IconButton>
            </TableCell>
            {/* <TableCell align = 'left' sx = {{width : 30}}>
                <IconButton
                    size = 'small'
                    onClick = {() => handleAccion(unPedido.estado)}                    
                >
                    {
                        generarBotonAccion(unPedido.estado)
                    }
                </IconButton>
            </TableCell> */}

        </TableRow>
    )
}

export default FilaPedidos;