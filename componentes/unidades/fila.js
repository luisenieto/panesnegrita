import { Fragment, useState } from "react";
import { TableRow, TableCell, IconButton, Box, Typography, Collapse } from '@mui/material';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import {RiEditLine} from 'react-icons/ri';
import {GoTrashcan} from 'react-icons/go';
import EquivalenciasDeUnaUnidad from "./equivalenciasDeUnaUnidad";
import { useRouter } from 'next/router';
import { ProveedorContexto } from "../../contexto/proveedor";
import { useContext } from "react";

const Fila = ({unaUnidad, setearOpenPopup}) => {
    const router = useRouter();
    const { setUnidadABorrar } = useContext(ProveedorContexto);

    const [abierto, setAbierto] = useState(false);  
    //maneja el botón flecha arriba/flecha abajo para mostrar las equivalencias de una unidad

    const mostrarEquivalencias = () => {
        setAbierto(!abierto);
    }

    //permite borrar un alumno
    const botonBorrarClic = () => {
        // if (!estaAutenticado()) {
        //     history.push('/acceso'); 
        // }
        // else {
            setUnidadABorrar(unaUnidad);
            setearOpenPopup(true);
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
                        aria-label = "expand row"
                        size = "small"
                        onClick = {mostrarEquivalencias}
                    >
                        {abierto ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell sx = {{width : 5}}>                        
                    <IconButton
                        size = 'small'
                        onClick = {() => {
                            router.push(`/unidades/modificacion/${unaUnidad.idUnidad}`);
                        }}
                    >
                        <RiEditLine />
                    </IconButton>                        
                </TableCell>  
                <TableCell sx = {{width : 5}}>
                    <IconButton
                        size = 'small'
                        onClick = {() => botonBorrarClic()}
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