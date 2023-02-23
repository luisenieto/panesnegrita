import { TableRow, TableCell, IconButton, Collapse, Box } from '@mui/material';
import {RiEditLine} from 'react-icons/ri';
import {GoTrashcan} from 'react-icons/go';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import PedidosDelCliente from './pedidosDelCliente';
import moment from 'moment';
import { useRouter } from 'next/router';

const Fila = ({ unCliente, setearOpenPopup }) => {
    const router = useRouter();
    const [abierto, setAbierto] = useState(false);  
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
    const mostrarPedidos = () => {
        if (!abierto) {
        }
        setAbierto(!abierto);  
    }

    //permite borrar un cliente (si se está logueado)
    const handleBorrar = () => {
        //Para poder borrar un cliente se debe estar logueado: sesion : <objeto> (si sesion ya vale algo
        //no hay necesidad de ver cuanto vale "estaAveriguando" porque ya terminó de averiguar)
        //Si sesion : null y estaAveriguando : "unauthenticated" hay que redirigir al formulario de logueo

        if (sesion) {
            //setIngredienteABorrar(unCliente);
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

    //formatea la fecha en el formato DD/MM/YYYY
    const formatearFecha = (fecha) => {
        return moment(fecha).format('DD/MM/YYYY');
    }

    return (
        <>
            <TableRow 
                hover                            
                sx = {{'&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell sx = {{width : 5}}>
                    <IconButton
                        aria-label = "expand row"
                        size = "small"
                        onClick = {mostrarPedidos}
                    >
                        {abierto ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                    </IconButton>                    
                </TableCell>
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
                <TableCell align = 'left' sx = {{maxWidth : 50}}>{unCliente.apellido}</TableCell>
                <TableCell align = 'left' sx = {{maxWidth : 50}}>{unCliente.nombre}</TableCell>
                <TableCell align = 'left' sx = {{maxWidth : 50}}>{unCliente.referencia}</TableCell>
                <TableCell align = 'left' sx = {{maxWidth : 50}}>{unCliente.telefono}</TableCell> 
                <TableCell align = 'left' sx = {{maxWidth : 40}}>{formatearFecha(unCliente.fechaNacimiento)}</TableCell>
                <TableCell align = 'left' sx = {{maxWidth : 60}}>{unCliente.correo}</TableCell>                 
            </TableRow>
            <PedidosDelCliente 
                abierto = {abierto}
                pedidos = {unCliente.pedidos}  
            />

            {/* <TableRow>
                <TableCell style = {{ paddingBottom: 0, paddingTop: 0 }} colSpan = {9}>
                    <Collapse in = {abierto} timeout = "auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <PedidosDelCliente 
                                pedidos = {unCliente.pedidos}                                
                            />
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>   */}
        </>
    )
}

export default Fila;