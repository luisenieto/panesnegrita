import { obtenerProductoParaModificar } from '../../../api/productos/bdAuxiliares';
import { ObjectId } from 'mongodb';
import { useState } from 'react';
import { Container, Paper, Grid } from '@mui/material';
import EtiquetaTitulo from '../../../../componentes/comunes/etiquetaTitulo';
import EtiquetaEstado from '../../../../componentes/comunes/etiquetaEstado';
import AutoCompletarCliente from '../../../../componentes/pedidos/autoCompletarCliente';
import CampoCantidad from '../../../../componentes/pedidos/campoCantidad';
import CampoImporte from '../../../../componentes/pedidos/campoImporte';
import { constantes } from '../../../../auxiliares/auxiliaresPedidos';
import { moneda } from '../../../../auxiliares/auxiliares';
import Botones from '../../../../componentes/pedidos/botones';
import MensajeInformativo from '../../../../componentes/comunes/mensajeInformativo';

//Componente que permite crear un nuevo pedido para un producto
const NuevoPedido = (props) => {
    const [producto, setProducto] = useState(props.producto); 
    //producto es el producto al que se está agregando un pedido
    //producto._id es String

    const [pedido, setPedido] = useState({
        idCliente : null,
        idProducto : producto._id, //producto._id es String
        cantidad : 1,
        importe : producto.precio,
        fecha : new Date(),
        estado : constantes.ESTADO_PEDIDO
    });
    //nuevo pedido que se hace del producto

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
                <EtiquetaTitulo leyenda = {constantes.PEDIDOS} />
                <EtiquetaEstado leyenda = {`${producto.nombre} | ${moneda(producto.precio)}`} />                
                <Grid container spacing = {2}>
                    <Grid item xs = {12}></Grid>
                    <AutoCompletarCliente 
                        leyenda = {constantes.CLIENTE}
                        pedido = {pedido}
                        setPedido = {setPedido}
                    />
                    <CampoCantidad 
                        leyenda = {constantes.CANTIDAD}
                        producto = {producto}
                        pedido = {pedido}
                        setPedido = {setPedido}
                    />
                    <CampoImporte 
                        leyenda = {constantes.IMPORTE}
                        pedido = {pedido}
                        setPedido = {setPedido}
                    />
                    <MensajeInformativo 
                        mensaje = {mensaje}
                        setMensaje = {setMensaje}
                        ruta = '/productos'
                    />
                    <Botones 
                        pedido = {pedido}
                        setMensaje = {setMensaje}
                        ruta = '/productos'
                        operacion = 'A'
                    />
                </Grid>
            </Paper>
        </Container>
    )
}

export const getServerSideProps = async (contexto) => {     
    const { params } = contexto;
    const _id = new ObjectId(params.idProducto);
    //params.idProducto es String

    const resultadoObtenerProducto = await obtenerProductoParaModificar(_id); 
    return {
        props : {    
            mensaje : resultadoObtenerProducto.mensaje,
            producto : JSON.parse(JSON.stringify(resultadoObtenerProducto.producto))               
        }
    }    
}

export default NuevoPedido;