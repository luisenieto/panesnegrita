import { Fragment, useContext } from "react";
import { TableRow, TableCell, IconButton } from '@mui/material';
import {RiEditLine} from 'react-icons/ri';
import {GoTrashcan} from 'react-icons/go';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { formatearFecha, moneda } from "../../auxiliares/auxiliares";
import Etiqueta from "../comunes/etiqueta";
import { constantes } from "../../auxiliares/auxiliaresIngredientes";
import { ProveedorContexto } from "../../contexto/proveedor";
import { mostrar2Decimales } from "../../auxiliares/auxiliares";

const Fila = ({unPedido, setearOpenPopup}) => {
    const router = useRouter();
    //const { setIngredienteABorrar, setRedirigirA } = useContext(ProveedorContexto); 

    const { data: sesion, status: estaAveriguando } = useSession(); 
    //a data se le cambia el nombre por sesion, y a status por estaAveriguando
    //useSession() devuelve un objeto con 2 claves
        //data: objeto que describe la sesión actual, el cual puede tomar 3 valores:
            //undefined: cuando todavía no se obtuvo información de la sesión
            //null: cuando ya se obtuvo información de la sesión y la misma muestra que el usuario no está logueado
            //objeto Session: cuando ya se obtuvo información de la sesión y la misma muestra que el usuario sí está logueado
        //status: indica si NextJS está todavía averiguando si el usuario está logueado o no
            //es una enumeración que puede valer "loading", "authenticated" o "unauthenticated"

    //permite borrar un ingrediente (si se está logueado)
    const handleBorrar = () => {
        //Para poder borrar un ingrediente se debe estar logueado: sesion : <objeto> (si sesion ya vale algo
        //no hay necesidad de ver cuanto vale "estaAveriguando" porque ya terminó de averiguar)
        //Si sesion : null y estaAveriguando : "unauthenticated" hay que redirigir al formulario de logueo

        // if (sesion) {
        //     setIngredienteABorrar(unIngrediente);
        //     setearOpenPopup(true);
        // }
        // if (!sesion && estaAveriguando === "unauthenticated") {
        //     setRedirigirA('ingredientes'); 
        //     router.push('/autenticacion');
        // }        
    }

    //permite editar un ingrediente (si se está logueado)
    const handleEditar = () => {                
        //Para poder editar un ingrediente se debe estar logueado: sesion : <objeto> (si sesion ya vale algo
        //no hay necesidad de ver cuanto vale "estaAveriguando" porque ya terminó de averiguar)
        //Si sesion : null y estaAveriguando : "unauthenticated" hay que redirigir al formulario de logueo

        // if (sesion) {
        //     router.push(`/ingredientes/modificacion/${unIngrediente._id}`);
        // }
        // if (!sesion && estaAveriguando === "unauthenticated") {
        //     setRedirigirA('ingredientes'); 
        //     router.push('/autenticacion');
        // }        
    }

    return (
        <Fragment>
            <TableRow 
                hover                            
                sx = {{'&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell sx = {{width : 5}}>                        
                    <IconButton
                        size = 'small'
                        onClick = { handleEditar }
                    >
                        <RiEditLine />
                    </IconButton>                        
                </TableCell>  
                <TableCell sx = {{width : 5}}>
                    <IconButton
                        size = 'small'
                        onClick = { handleBorrar }
                    >
                        <GoTrashcan />
                    </IconButton>
                </TableCell>
                <TableCell align = 'left' sx = {{maxWidth : 30}}>{ formatearFecha(unPedido.fecha) }</TableCell>
                <TableCell align = 'left' sx = {{maxWidth : 60}}>{ `${unPedido.cliente.apellido}, ${unPedido.cliente.nombre}` }</TableCell>
                <TableCell align = 'left' sx = {{maxWidth : 60}}>{ unPedido.producto.nombre }</TableCell>
                <TableCell align = 'center' sx = {{maxWidth : 20}}>{ unPedido.cantidad }</TableCell>
                <TableCell align = 'center' sx = {{maxWidth : 30}}>{ moneda(unPedido.importe) }</TableCell>
            </TableRow>
        </Fragment>
    )
}

export default Fila;