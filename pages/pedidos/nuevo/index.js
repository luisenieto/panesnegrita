import { Container, Paper, Grid } from '@mui/material';
import EtiquetaTitulo from '../../../componentes/comunes/etiquetaTitulo';
import EtiquetaEstado from '../../../componentes/comunes/etiquetaEstado';
import { constantes } from '../../../auxiliares/auxiliaresPedidos';
import AutoCompletarCliente from '../../../componentes/pedidos/autoCompletarCliente';
import AutoCompletarProducto from '../../../componentes/pedidos/autoCompletarProducto';
import CampoCantidad from '../../../componentes/pedidos/campoCantidad';
import CampoImporte from '../../../componentes/pedidos/campoImporte';
import Botones from '../../../componentes/pedidos/botones';
import MensajeInformativo from '../../../componentes/comunes/mensajeInformativo';
import { useState } from 'react';

//Componente que permite crear un nuevo pedido para un producto
const NuevoPedido = () => {

    const [pedido, setPedido] = useState({
        idCliente : null,
        idProducto : null, 
        cantidad : 1,
        importe : 1,
        fecha : new Date(),
        estado : constantes.ESTADO_PEDIDO
    });
    //nuevo pedido que se hace

    // const producto = {
    //     precio : 1
    // }

    const [mensaje, setMensaje] = useState({
        gravedad : 'error',
        titulo : '',
        texto : '',
        mostrar : false
    });
    //controla el componente MensajeInformativo

    return (
        <Container component = "main"  sx = {{ mb: 4 }}>
            <Paper variant = "outlined" sx = {{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <EtiquetaTitulo leyenda = { constantes.PEDIDOS } />
                <EtiquetaEstado leyenda = { constantes.NUEVO_PEDIDO } />      
                <Grid container spacing = { 2 }>
                    <Grid item xs = {12}></Grid>                    
                    <AutoCompletarProducto
                        leyenda = { constantes.PRODUCTO }
                        pedido = { pedido }
                        setPedido = { setPedido }
                    />
                    <CampoCantidad 
                        leyenda = { constantes.CANTIDAD }
                        // producto = { producto }
                        pedido = { pedido }
                        setPedido = { setPedido }
                    />
                    <CampoImporte 
                        leyenda = { constantes.IMPORTE }
                        pedido = { pedido }
                        setPedido = { setPedido }
                    />
                    <AutoCompletarCliente 
                        leyenda = { constantes.CLIENTE }
                        pedido = { pedido }
                        setPedido = { setPedido }
                    />
                    <MensajeInformativo 
                        mensaje = {mensaje}
                        setMensaje = {setMensaje}
                        ruta = '/pedidos'
                    />
                    <Botones 
                        pedido = { pedido }
                        setMensaje = { setMensaje }
                        ruta = '/pedidos'
                        operacion = 'A'
                    />
                </Grid>          
            </Paper>
        </Container>
    )
}

export default NuevoPedido;