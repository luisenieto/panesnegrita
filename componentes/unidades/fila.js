import { Fragment, useState, useContext } from "react";
import { TableRow, TableCell, IconButton } from '@mui/material';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import {RiEditLine} from 'react-icons/ri';
import {GoTrashcan} from 'react-icons/go';
import EquivalenciasDeUnaUnidad from "./equivalenciasDeUnaUnidad";
import { useRouter } from 'next/router';
import { ProveedorContexto } from "../../contexto/proveedor";
import { useSession } from 'next-auth/react';

//Componente que muestra una fila en la tabla de unidades
const Fila = ({unaUnidad, setearOpenPopup}) => {
    const router = useRouter();
    const { setUnidadABorrar, setRedirigirA } = useContext(ProveedorContexto);

    const [abierto, setAbierto] = useState(false);  
    //maneja el botón flecha arriba/flecha abajo para mostrar las equivalencias de una unidad

    const { data: sesion, status: estaAveriguando } = useSession(); 
        //a data se le cambia el nombre por sesion, y a status por estaAveriguando
        //useSession() devuelve un objeto con 2 claves
            //data: objeto que describe la sesión actual, el cual puede tomar 3 valores:
                //undefined: cuando todavía no se obtuvo información de la sesión
                //null: cuando ya se obtuvo información de la sesión y la misma muestra que el usuario no está logueado
                //objeto Session: cuando ya se obtuvo información de la sesión y la misma muestra que el usuario sí está logueado
            //status: indica si NextJS está todavía averiguando si el usuario está logueado o no
                //es una enumeración que puede valer "loading", "authenticated" o "unauthenticated"

    const mostrarEquivalencias = () => {
        setAbierto(!abierto);
    }

    //permite borrar una unidad (si se está logueado)
    const handleBorrar = () => {
        //Para poder borrar una unidad se debe estar logueado: sesion : <objeto> (si sesion ya vale algo
        //no hay necesidad de ver cuanto vale "estaAveriguando" porque ya terminó de averiguar)
        //Si sesion : null y estaAveriguando : "unauthenticated" hay que redirigir al formulario de logueo

        if (sesion) {
            setUnidadABorrar(unaUnidad);
            setearOpenPopup(true);
        }
        if (!sesion && estaAveriguando === "unauthenticated") {             
            router.push('/autenticacion');
        }        
    }

    //permite editar una unidad (si se está logueado)
    const handleEditar = () => {                
        //Para poder editar una unidad se debe estar logueado: sesion : <objeto> (si sesion ya vale algo
        //no hay necesidad de ver cuanto vale "estaAveriguando" porque ya terminó de averiguar)
        //Si sesion : null y estaAveriguando : "unauthenticated" hay que redirigir al formulario de logueo

        if (sesion) {
            router.push(`/unidades/modificacion/${unaUnidad._id}`);
        }
        if (!sesion && estaAveriguando === "unauthenticated") {
            setRedirigirA('unidades');
            router.push('/autenticacion');
        }        
    }

    return (
        <Fragment>
            <TableRow 
                hover                            
                sx = {{'&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell sx = {{width : 5}}>
                    <IconButton
                        aria-label = "expand row"
                        size = "small"
                        onClick = { mostrarEquivalencias }
                    >
                        {abierto ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                    </IconButton>
                </TableCell>
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
                <TableCell align = 'left' sx = {{maxWidth : 360}}>{unaUnidad.nombre}</TableCell>
            </TableRow>

            <TableRow>
                <EquivalenciasDeUnaUnidad abierto = {abierto} equivalencias = {unaUnidad.equivalencias}/>
            </TableRow>
        </Fragment>
    )
}

export default Fila;