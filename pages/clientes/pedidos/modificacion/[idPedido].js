import { obtenerPedidoParaModificar } from "../../../api/pedidos/bdAuxiliares";
import { useState } from "react";
import { Container, Paper, Grid } from '@mui/material';
import EtiquetaTitulo from "../../../../componentes/comunes/etiquetaTitulo";
import EtiquetaEstado from "../../../../componentes/comunes/etiquetaEstado";
import CampoCantidad from "../../../../componentes/pedidos/campoCantidad";
import CampoImporte from "../../../../componentes/pedidos/campoImporte";
import AutoCompletarProducto from "../../../../componentes/pedidos/autoCompletarProducto";
import MensajeInformativo from "../../../../componentes/comunes/mensajeInformativo";
import Botones from "../../../../componentes/pedidos/botones";
import { ObjectId } from 'mongodb';
import { constantes } from "../../../../auxiliares/auxiliaresPedidos";

//Componente que permite modificar un pedido viéndolo desde un cliente
const ModificarPedido = (props) => {
    const [pedido, setPedido] = useState(props.pedido);
    //pedido es el pedido que se está modificando
    //pedido._id es String

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
                <EtiquetaTitulo leyenda = { constantes.PEDIDOS_MODIFICACION } />
                <EtiquetaEstado leyenda = { `${pedido.cliente.apellido}, ${pedido.cliente.nombre}` } />
                <Grid container spacing = {2}>
                    <Grid item xs = {12}></Grid>
                    <AutoCompletarProducto 
                        leyenda = {constantes.PRODUCTO}
                        pedido = {pedido}
                        setPedido = {setPedido}
                    />
                    <CampoCantidad 
                        leyenda = {constantes.CANTIDAD}
                        producto = {pedido.producto}
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
                        ruta = {`/clientes/pedidos/${pedido.idCliente}`}
                    />
                    <Botones 
                        pedido = {pedido}
                        setMensaje = {setMensaje}
                        ruta = {`/clientes/pedidos/${pedido.idCliente}`}
                        operacion = 'M'
                    />
                </Grid>
            </Paper>
        </Container>
    )
}

export const getServerSideProps = async (contexto) => {  
    const { params } = contexto;
    const _id = new ObjectId(params.idPedido);
    //params.idPedido es String

    const resultadoObtenerPedido = await obtenerPedidoParaModificar(_id); 
    return {
        props : {    
            mensaje : resultadoObtenerPedido.mensaje,
            pedido : JSON.parse(JSON.stringify(resultadoObtenerPedido.pedido))               
        }
    }
}

export default ModificarPedido;