import { ObjectId } from 'mongodb';
import { obtenerClienteParaModificar } from '../../api/clientes/bdAuxiliares';
import { useState } from 'react';
import { Container, Paper, Grid, TableContainer, Table, Button } from '@mui/material';
import EtiquetaTitulo from '../../../componentes/comunes/etiquetaTitulo';
import EtiquetaEstado from '../../../componentes/comunes/etiquetaEstado';
import { constantes } from '../../../auxiliares/auxiliaresPedidos';
import { constantes as constantesAplicacion } from '../../../auxiliares/auxiliaresAplicacion';
import { constantes as constantesClientes } from '../../../auxiliares/auxiliaresClientes';
import CabeceraTablaPedidos from '../../../componentes/clientes/cabeceraTablaPedidos';
import CuerpoTablaPedidos from '../../../componentes/clientes/cuerpoTablaPedidos';
import PaginacionTablaPedidos from '../../../componentes/clientes/paginacionTablaPedidos';
import { useRouter } from 'next/router';
import Popup from '../../../componentes/pedidos/popupCliente';
import MensajeInformativo from '../../../componentes/comunes/mensajeInformativo';

const Pedidos = (props) => {
    
    const [cliente, setCliente] = useState(props.cliente); 
    //cliente es el cliente al que se está mostrando los pedidos
    //cliente._id es String    

    const router = useRouter();

    const [orden, setearOrden] = useState('asc');
    //por defecto, los ... se ordenan alfabéticamente
    
    const ordenarPor = 'producto';
    //sólo se pueden ordenar los pedidos por su ....

    const [pagina, setearPagina] = useState(0);
    //para saber en qué página se está (empieza en la 0)

    const [filasPorPagina, setearFilasPorPagina] = useState(10);
    //por defecto se muestran 10 clientes por página

    const [openPopup, setearOpenPopup] = useState(false);
    //controla la visibilidad del popup (pregunta si se confirma la cancelación del pedido)

    const [mensaje, setMensaje] = useState(
        props.mensaje === constantesClientes.CLIENTES_LEIDOS_CORRECTAMENTE ?
            {
                gravedad : 'error',
                titulo : '',
                texto : '',
                mostrar : false
            }
        :
            {
                gravedad : 'error',
                titulo : constantesAplicacion.ERROR,
                texto : props.mensaje || constantesClientes.ERROR_LEER_CLIENTES,
                mostrar : true
            }
    );
    //controla el componente MensajeInformativo

    //configura el criterio de ordenamiento en asc o desc para ordenar los pedidos
    const configurarOrdenamiento = () => {
        setearOrden(orden === 'asc' ? 'desc' : 'asc');
    }
    
    return (
        <Container component = "main"  sx = {{ mb: 4 }}>
            <Paper variant = "outlined" sx = {{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <EtiquetaTitulo leyenda = {constantes.PEDIDOS} />
                <EtiquetaEstado leyenda = {`${cliente.apellido}, ${cliente.nombre} (${cliente.referencia})`} />
                <Grid container spacing = {1}>
                    <Grid item xs = {12}>
                        {
                            !mensaje.mostrar ? 
                                <>
                                    <TableContainer sx = {{ maxHeight: 440 }} >
                                        <Table stickyHeader 
                                            // sx = {{width : 350}} 
                                            aria-labelledby = 'tituloTabla' 
                                            size = 'medium'
                                        >
                                            <CabeceraTablaPedidos
                                                orden = {orden}
                                                configurarOrdenamiento = {configurarOrdenamiento}
                                            />
                                            <CuerpoTablaPedidos
                                                ordenarPor = {ordenarPor}
                                                orden = {orden}                                                
                                                pagina = {pagina}
                                                filasPorPagina = {filasPorPagina}
                                                cliente = {cliente}
                                                setCliente = {setCliente}
                                                setearOpenPopup = {setearOpenPopup}
                                            />
                                        </Table>
                                    </TableContainer>
                                    <PaginacionTablaPedidos
                                        filasPorPagina = {filasPorPagina}
                                        setearFilasPorPagina = {setearFilasPorPagina}
                                        pagina = {pagina}
                                        setearPagina = {setearPagina}
                                        cantPedidos = {cliente.pedidos.length}
                                    />
                                    <Popup 
                                        cliente = {cliente}
                                        setCliente = {setCliente}
                                        titulo = {constantesAplicacion.TITULO_APLICACION}
                                        texto = {constantes.MENSAJE_CONFIRMAR_CANCELACION}
                                        openPopup = {openPopup}
                                        setearOpenPopup = {setearOpenPopup}
                                        setMensaje = {setMensaje}
                                    />
                                </>
                            :
                                <MensajeInformativo 
                                    mensaje = {mensaje}
                                    setMensaje = {setMensaje}
                                    ruta = {`/clientes/pedidos/${cliente._id}`}
                                />
                        }
                    </Grid>

                    <Grid item xs = {12}>
                        <Grid container direction = 'row-reverse' sx = {{marginTop : 2}}> 
                            <Button 
                                variant = 'contained'
                                sx = {{
                                    marginLeft : '0px',
                                    padding : '20px 5px',
                                }}
                                //sx = {{color : tema.palette.secondary.main}}
                                //disabled = {mostrar}
                                onClick = {() => router.push('/clientes')}
                            >
                                {constantes.VOLVER}
                            </Button>
                        </Grid>
                    </Grid>
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
            cliente : JSON.parse(JSON.stringify(resultadoObtenerCliente.cliente))               
        }
    }   
}

export default Pedidos;