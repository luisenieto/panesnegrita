import { useState } from 'react';
import { Container, Paper, Grid } from '@mui/material';
//import DetalleCliente from '../../../componentes/clientes/detalleCliente';
//import FotoCliente from '../../../componentes/clientes/fotoCliente';
import EtiquetaTitulo from '../../../componentes/comunes/etiquetaTitulo';
import EtiquetaEstado from '../../../componentes/comunes/etiquetaEstado';
import { constantes } from '../../../auxiliares/auxiliaresClientes';
import CampoNombre from '../../../componentes/clientes/campoNombre';
import CampoApellido from '../../../componentes/clientes/campoApellido';
import CampoReferencia from '../../../componentes/clientes/campoReferencia';
import CampoTelefono from '../../../componentes/clientes/campoTelefono';
import CampoCorreo from '../../../componentes/clientes/campoCorreo';
import CampoFechaNacimiento from '../../../componentes/clientes/campoFechaNacimiento';
import Botones from '../../../componentes/clientes/botones';
import MensajeInformativo from '../../../componentes/comunes/mensajeInformativo';
import { controlarSiSeEstaLogueado } from '../../../lib/auth';
import { MdImportExport } from 'react-icons/md';

//Componente que permite crear un cliente nuevo
const NuevoCliente = () => {
    const [nuevoCliente, setNuevoCliente ] = useState({
        //el _id lo genera MongoDB
        nombre : '',
        apellido : '',
        referencia : '',
        telefono : '',
        correo : '',
        fechaNacimiento : null,
        pedidos : []
    });
    //nuevoClinte es el cliente que se está creando  

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
                <EtiquetaTitulo leyenda = {constantes.CLIENTES} />
                <EtiquetaEstado leyenda = {constantes.NUEVO_CLIENTE} />
                <Grid container spacing = {2}>  
                    {/* <Foto      
                        cliente = {nuevoCliente}  
                        setCliente = {setNuevoCliente} 
                        avatars = {avatars}
                        setAvatars = {setAvatars}            
                    /> */}
                    <CampoNombre 
                        leyenda = {constantes.NOMBRE}
                        cliente = {nuevoCliente} 
                        setCliente = {setNuevoCliente} 
                        mostrar = {mensaje.mostrar}
                    />                    
                    <CampoApellido
                        leyenda = {constantes.APELLIDO}
                        cliente = {nuevoCliente} 
                        setCliente = {setNuevoCliente} 
                        mostrar = {mensaje.mostrar}
                    />
                    <CampoReferencia
                        leyenda = {constantes.REFERENCIA}
                        cliente = {nuevoCliente} 
                        setCliente = {setNuevoCliente} 
                        mostrar = {mensaje.mostrar}
                    />
                    <CampoTelefono
                        leyenda = {constantes.TELEFONO}
                        cliente = {nuevoCliente} 
                        setCliente = {setNuevoCliente} 
                        mostrar = {mensaje.mostrar}
                    />
                    <CampoCorreo
                        leyenda = {constantes.CORREO}
                        cliente = {nuevoCliente} 
                        setCliente = {setNuevoCliente} 
                        mostrar = {mensaje.mostrar}
                    />
                    <CampoFechaNacimiento
                        leyenda = {constantes.FECHA_NACIMIENTO}
                        cliente = {nuevoCliente} 
                        setCliente = {setNuevoCliente} 
                        mostrar = {mensaje.mostrar}
                    />
                    <MensajeInformativo 
                        mensaje = {mensaje}
                        setMensaje = {setMensaje}
                        ruta = '/clientes'
                    />
                    <Botones 
                        mostrar = {mensaje.mostrar}
                        cliente = {nuevoCliente}
                        setMensaje = {setMensaje}                        
                        operacion = 'A'
                    />
                </Grid>
            </Paper>
        </Container>        
    )
}

//No se puede crear un cliente sin estar logueado
export const getServerSideProps = async (contexto) => {
    return await controlarSiSeEstaLogueado(contexto.req);
}

export default NuevoCliente;