import { Fragment } from 'react';
import { TableRow, TableCell, Collapse, Box, Card, Link, Typography, Stack } from '@mui/material';
//import PedidosEnColores from './pedidosEnColores';
import numeral from 'numeral';

//Componente que muestra los pedidos de un cliente
const PedidosDelCliente = ({ abierto, pedidos}) => {

    //formatea una cadena para que tenga un largo máximo de 300 caracteres
    //sirve para mostrar el texto del pedido con los puntitos
    const formatearCadena = (cadena) => {
        // if (cadena.length > 12)
        //     return cadena.substring(0, 8) + "..."
        if (cadena.length < 300)
            return cadena + ' ' + '.'.repeat(300 - cadena.length)
        else
            return cadena;
    }

    //permite formatear un importe monetario
    const moneda = (numero) => {
        const formato = numero ? numeral(numero).format('$0,0.00') : '';
        return resultado(formato, '.00');
    }

    const resultado = (formato, clave = '.00') => {
        const isInteger = formato.includes(clave);
        return isInteger ? formato.replace(clave, '') : formato;
    }

    return (
        <>
            {            
                pedidos.map((pedido, i) => (
                    <TableRow key = {i}>
                        <TableCell sx = {{width : 5}} style = {{ paddingBottom: 0, paddingTop: 0 }} >
                            <Collapse in = {abierto} timeout = "auto" unmountOnExit>
                                &nbsp;
                            </Collapse>
                        </TableCell>
                        {/* <TableCell sx = {{width : 5}} style = {{ paddingBottom: 0, paddingTop: 0 }} >
                            <Collapse in = {abierto} timeout = "auto" unmountOnExit>
                                &nbsp;
                            </Collapse>
                        </TableCell>
                        <TableCell sx = {{width : 5}} style = {{ paddingBottom: 0, paddingTop: 0 }} >
                            <Collapse in = {abierto} timeout = "auto" unmountOnExit>
                                &nbsp;
                            </Collapse>
                        </TableCell> */}

                        <TableCell align = 'left' sx = {{maxWidth : 50}} style = {{ paddingBottom: 0, paddingTop: 0 }} colSpan = {8}>
                            <Collapse in = {abierto} timeout = "auto" unmountOnExit>     
                                <Stack key = {pedido._id} direction = "row" alignItems = "center" justifyContent = "space-between">                       
                                    <Typography align = "left" variant = "subtitle2" noWrap>
                                        &nbsp;
                                        {/* {formatearCadena(pedido.nombre)} */}
                                    </Typography>
                                    <Typography variant="subtitle2" sx = {{ fontWeight: 'bold' }} >
                                        &nbsp;
                                        {moneda(pedido.importe)}
                                    </Typography>
                                </Stack>
                            </Collapse>
                        </TableCell>

                        {/* <TableCell align = 'left' sx = {{maxWidth : 50}} style = {{ paddingBottom: 0, paddingTop: 0 }} >
                            <Collapse in = {abierto} timeout = "auto" unmountOnExit>
                            <Typography align = "left" variant = "subtitle2" noWrap>
                                &nbsp;
                                {pedido.nombre}
                            </Typography>
                            </Collapse>
                        </TableCell>
                        <TableCell align = 'left' sx = {{maxWidth : 50}} style = {{ paddingBottom: 0, paddingTop: 0 }} colSpan = {4}>
                            <Collapse in = {abierto} timeout = "auto" unmountOnExit>
                            <Typography variant="subtitle2" sx = {{ fontWeight: 'bold' }} >
                                &nbsp;
                                {moneda(pedido.importe)}
                            </Typography>
                            </Collapse>
                        </TableCell> */}
                    </TableRow>
                ))
            }
        </>
    )
}

export default PedidosDelCliente;