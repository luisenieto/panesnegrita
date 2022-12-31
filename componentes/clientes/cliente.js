import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import PedidosEnColores from './pedidosEnColores';
import numeral from 'numeral';
//import Link from 'next/link';

const FotoClienteConEstilo = styled('img')({
    top: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
});

//Componente que muestra la información de un cliente
const Cliente = ({cliente}) => {
    const { foto, nombre, apellido, referencia, pedidos } = cliente;

    // const pedidos = [
    //     {
    //         _id: 1,
    //         idProducto : 1,
    //         nombre : 'Pan 1 Pan 1 Pan 1 Pan 1',
    //         cantidad : 3,
    //         importe : 500.50,
    //         estado : 'pedido'
    //     },
    //     {
    //         _id: 2,
    //         idProducto : 2,
    //         nombre : 'Pan 2',
    //         cantidad : 2,
    //         importe : 250.50,
    //         estado : 'en elaboración'
    //     },
    //     {
    //         _id: 3,
    //         idProducto : 3,
    //         nombre : 'Pan 3',
    //         cantidad : 1,
    //         importe : 100.0,
    //         estado : 'terminado'
    //     }
    // ]

    //formatea una cadena para que tenga un largo máximo de 30 caracteres
    const formatearCadena = (cadena) => {
        // if (cadena.length > 12)
        //     return cadena.substring(0, 8) + "..."
        if (cadena.length < 50)
            return cadena + ' ' + '.'.repeat(50 - cadena.length)
        else
            return cadena;
    }

    const moneda = (numero) => {
        const formato = numero ? numeral(numero).format('$0,0.00') : '';
        return resultado(formato, '.00');
    }

    const resultado = (formato, clave = '.00') => {
        const isInteger = formato.includes(clave);
        return isInteger ? formato.replace(clave, '') : formato;
    }

    return (
        <Card>
            <Box sx = {{ pt: '100%', position: 'relative' }}>
                <FotoClienteConEstilo alt = {nombre} src = {foto} />
            </Box>

            <Stack spacing = {1} sx = {{ p: 2 }}>
                <Link color = "inherit" underline = "hover" href = {`/clientes/modificacion/${cliente._id}`}>
                    <Typography align = "center" variant = "subtitle1" noWrap>
                        {nombre} {apellido} ({referencia})
                    </Typography>
                </Link>
                {
                    pedidos.map(pedido => (
                        <Stack key = {pedido._id} direction = "row" alignItems = "center" justifyContent = "space-between">
                            <PedidosEnColores estado = {pedido.estado} cantidad = {pedido.cantidad}/>
                            <Typography align = "left" variant = "subtitle2" noWrap>
                                &nbsp;
                                {formatearCadena(pedido.nombre)}
                            </Typography>
                            <Typography variant="subtitle2" sx = {{ fontWeight: 'bold' }} >
                                &nbsp;
                                {moneda(pedido.importe)}
                            </Typography>     
                        </Stack>
                    ))
                }
            </Stack>
        </Card>
    )
}

export default Cliente;