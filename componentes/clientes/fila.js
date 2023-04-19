import { TableRow, TableCell, IconButton } from '@mui/material';
import {RiEditLine} from 'react-icons/ri';
import {GoTrashcan} from 'react-icons/go';
import { BsCart2 } from 'react-icons/bs';
import { useSession } from 'next-auth/react';
import { formatearFecha } from '../../auxiliares/auxiliares';
import { useRouter } from 'next/router';
import { ProveedorContexto } from '../../contexto/proveedor';
import { useContext } from 'react';

const Fila = ({ unCliente, setearOpenPopup }) => {
    const router = useRouter();
    const { setClienteABorrar, setRedirigirA } = useContext(ProveedorContexto);

    const { data: sesion, status: estaAveriguando } = useSession(); 
    //a data se le cambia el nombre por sesion, y a status por estaAveriguando
    //useSession() devuelve un objeto con 2 claves
        //data: objeto que describe la sesión actual, el cual puede tomar 3 valores:
            //undefined: cuando todavía no se obtuvo información de la sesión
            //null: cuando ya se obtuvo información de la sesión y la misma muestra que el usuario no está logueado
            //objeto Session: cuando ya se obtuvo información de la sesión y la misma muestra que el usuario sí está logueado
        //status: indica si NextJS está todavía averiguando si el usuario está logueado o no
            //es una enumeración que puede valer "loading", "authenticated" o "unauthenticated"

    //gestiona los pedidos del cliente
    const handlePedidos = (_id) => {
        setRedirigirA(`/clientes/pedidos/${_id}`);
        router.push(`/clientes/pedidos/${_id}`);
    }

    //permite borrar un cliente (si se está logueado)
    const handleBorrar = () => {
        //Para poder borrar un cliente se debe estar logueado: sesion : <objeto> (si sesion ya vale algo
        //no hay necesidad de ver cuanto vale "estaAveriguando" porque ya terminó de averiguar)
        //Si sesion : null y estaAveriguando : "unauthenticated" hay que redirigir al formulario de logueo

        if (sesion) {
            setClienteABorrar(unCliente);
            setearOpenPopup(true);
        }
        if (!sesion && estaAveriguando === "unauthenticated") {
            setRedirigirA('clientes'); 
            router.push('/autenticacion');
        }        
    }

    //permite editar un cliente (si se está logueado)
    const handleEditar = () => {                
        //Para poder editar un ingrediente se debe estar logueado: sesion : <objeto> (si sesion ya vale algo
        //no hay necesidad de ver cuanto vale "estaAveriguando" porque ya terminó de averiguar)
        //Si sesion : null y estaAveriguando : "unauthenticated" hay que redirigir al formulario de logueo

        if (sesion) {
            router.push(`/clientes/modificacion/${unCliente._id}`);
        }
        if (!sesion && estaAveriguando === "unauthenticated") {
            setRedirigirA('clientes'); 
            router.push('/autenticacion');
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
                    onClick = {handleEditar}
                >
                    <RiEditLine />
                </IconButton>                        
            </TableCell>  
            <TableCell sx = {{width : 5}}>
                <IconButton
                    size = 'small'
                    onClick = {handleBorrar}
                >
                    <GoTrashcan />
                </IconButton>
            </TableCell> 
            <TableCell sx = {{width : 5}}>
                <IconButton
                    size = 'small'
                    disabled = { unCliente.pedidos.length === 0}
                    onClick = {evento => handlePedidos(unCliente._id)}
                >
                    <BsCart2 />
                </IconButton>
            </TableCell> 
            <TableCell align = 'left' sx = {{maxWidth : 50}}>{unCliente.apellido}</TableCell>
            <TableCell align = 'left' sx = {{maxWidth : 50}}>{unCliente.nombre}</TableCell>
            <TableCell align = 'left' sx = {{maxWidth : 50}}>{unCliente.referencia}</TableCell>
            <TableCell align = 'left' sx = {{maxWidth : 50}}>{unCliente.telefono}</TableCell> 
            <TableCell align = 'left' sx = {{maxWidth : 40}}>{formatearFecha(unCliente.fechaNacimiento)}</TableCell>
            <TableCell align = 'left' sx = {{maxWidth : 60}}>{unCliente.correo}</TableCell>                 
        </TableRow>
    )
}

export default Fila;