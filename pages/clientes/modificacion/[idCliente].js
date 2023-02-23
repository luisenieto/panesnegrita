import { obtenerClienteParaModificar } from "../../api/clientes/bdAuxiliares";
import { useState, useContext, useEffect } from "react";
import { ObjectId } from 'mongodb';
import { ProveedorContexto } from "../../../contexto/proveedor";
import { constantes } from "../../../auxiliares/auxiliaresClientes";
import { Box, Container, Paper, Grid, Chip, Divider, Typography } from '@mui/material';
import EtiquetaTitulo from "../../../componentes/comunes/etiquetaTitulo";
import EtiquetaEstado from "../../../componentes/comunes/etiquetaEstado";
import CampoNombre from "../../../componentes/clientes/campoNombre";
import CampoApellido from "../../../componentes/clientes/campoApellido";
import CampoReferencia from "../../../componentes/clientes/campoReferencia";
import CampoTelefono from "../../../componentes/clientes/campoTelefono";
import CampoCorreo from "../../../componentes/clientes/campoCorreo";
import CampoFechaNacimiento from "../../../componentes/clientes/campoFechaNacimiento";
import Botones from "../../../componentes/clientes/botones";
import MensajeInformativo from "../../../componentes/comunes/mensajeInformativo";

//Componente que permite modificar un cliente
const ModificacionCliente = (props) => { 
    //const { setClientes } = useContext(ProveedorContexto);

    const [clienteAModificar, setClienteAModificar] = useState(props.cliente);    
    //clienteAModificar es el cliente que se está modificando       
    //clienteAModificar._id es String

    //const clientes = props.clientes;
    //los _id son String

    //useEffect(() => {
    //    if (clientes)
    //        setClientes(clientes);
    //}, []); //eslint-disable-line react-hooks/exhaustive-deps 
    //el comentario anterior es para que en la consola no aparezca el warning diciendo que el array de depdencias de useEffect está vacío

    const [mensaje, setMensaje] = useState(
        props.mensaje === constantes.CLIENTES_LEIDOS_CORRECTAMENTE ?
            {
                gravedad : 'error',
                titulo : '',
                texto : '',
                mostrar : false
            }
        :
            {
                gravedad : 'error',
                titulo : 'Error',
                texto : props.mensaje,
                mostrar : true
            } 
    );
    //controla el componente MensajeInformativo

    return (
        <Container component = "main"  sx = {{ mb: 4 }}>
            <Paper variant = "outlined" sx = {{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <EtiquetaTitulo leyenda = {constantes.CLIENTES} />
                <EtiquetaEstado leyenda = {constantes.MODIFICACION_CLIENTE} />
                <Grid container spacing = {2}>  
                    <CampoNombre 
                        leyenda = {constantes.NOMBRE}
                        cliente = {clienteAModificar} 
                        setCliente = {setClienteAModificar} 
                        mostrar = {mensaje.mostrar}
                    />                    
                    <CampoApellido
                        leyenda = {constantes.APELLIDO}
                        cliente = {clienteAModificar} 
                        setCliente = {setClienteAModificar} 
                        mostrar = {mensaje.mostrar}
                    />
                    <CampoReferencia
                        leyenda = {constantes.REFERENCIA}
                        cliente = {clienteAModificar} 
                        setCliente = {setClienteAModificar} 
                        mostrar = {mensaje.mostrar}
                    />
                    <CampoTelefono
                        leyenda = {constantes.TELEFONO}
                        cliente = {clienteAModificar} 
                        setCliente = {setClienteAModificar} 
                        mostrar = {mensaje.mostrar}
                    />
                    <CampoCorreo
                        leyenda = {constantes.CORREO}
                        cliente = {clienteAModificar} 
                        setCliente = {setClienteAModificar} 
                        mostrar = {mensaje.mostrar}
                    />
                    <CampoFechaNacimiento
                        leyenda = {constantes.FECHA_NACIMIENTO}
                        cliente = {clienteAModificar} 
                        setCliente = {setClienteAModificar} 
                        mostrar = {mensaje.mostrar}
                    />
                    <MensajeInformativo 
                        mensaje = {mensaje}
                        setMensaje = {setMensaje}
                        ruta = '/clientes'
                    />
                    <Grid item xs = {12}>
                        <Divider>
                            <Chip label = {constantes.PEDIDOS} />  
                        </Divider>
                    </Grid>
                    <Botones 
                        mostrar = {mensaje.mostrar}
                        cliente = {clienteAModificar}
                        setMensaje = {setMensaje}                        
                        operacion = 'M'
                    />
                </Grid>
            </Paper>
        </Container>
    )
}

export const getServerSideProps = async (contexto) => {     
    const { params } = contexto;
    const _id = new ObjectId(params.idCliente);
    //params.idCliente es String

    const resultadoObtenerCliente = await obtenerClienteParaModificar(_id); 
    return {
        props : {    
            mensaje : resultadoObtenerCliente.mensaje,
            cliente : JSON.parse(JSON.stringify(resultadoObtenerCliente.cliente)),               
            clientes: JSON.parse(JSON.stringify(resultadoObtenerCliente.clientes)),            
        }
    }    
}

export default ModificacionCliente;