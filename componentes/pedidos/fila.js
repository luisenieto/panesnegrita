import { TableRow, TableCell, IconButton } from '@mui/material';
import { CgPlayStopO } from 'react-icons/cg';
import { TbTruckDelivery } from 'react-icons/tb';
import { GiPressureCooker } from 'react-icons/gi';
import { useSession } from 'next-auth/react';
//import PedidosDelCliente from './pedidosDelCliente';
import { useRouter } from 'next/router';
import { constantes } from '../../auxiliares/auxiliaresPedidos';
import Etiqueta from '../comunes/etiqueta';
import { moneda } from '../../auxiliares/auxiliares';
import axios from 'axios';
import { formatearFecha } from '../../auxiliares/auxiliares';

const Fila = ({ unPedido, producto, setProducto, setearOpenPopup }) => {
    const router = useRouter();
    //const [abierto, setAbierto] = useState(false);  
    //maneja el botón flecha arriba/flecha abajo para mostrar los pedidos de un cliente

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
            case constantes.ESTADO_PEDIDO : return (< GiPressureCooker/>)
            case constantes.ESTADO_ELABORACION : return (< CgPlayStopO/>)
            case constantes.ESTADO_TERMINADO : return (< TbTruckDelivery/>)
            default: return null;
        }
    }

    //Cambia el estado del pedido
    const handleAccion = async (estado) => {
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
            const respuesta = await axios.post(ruta, {...pedidoUpdate, operacion : 'M' });
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
            <TableCell align = 'left' sx = {{maxWidth : 50}}>{`${unPedido.apellido}, ${unPedido.nombre}`}</TableCell>
            <TableCell align = 'center' sx = {{maxWidth : 20}}>{unPedido.cantidad}</TableCell>
            <TableCell align = 'center' sx = {{maxWidth : 30}}>{moneda(unPedido.importe)}</TableCell>
            <TableCell align = 'center' sx = {{maxWidth : 30}}>{formatearFecha(unPedido.fecha)}</TableCell> 
            <TableCell align = 'center' sx = {{maxWidth : 30}}>{generarEstado(unPedido.estado)}</TableCell>
            <TableCell align = 'left' sx = {{width : 30}}>
                <IconButton
                    size = 'small'
                    onClick = {() => handleAccion(unPedido.estado)}
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