import { Grid, TableContainer, Table, Card, Button } from '@mui/material';
import { useState, useContext } from 'react';
import { obtenerPedidos } from '../api/pedidos/bdAuxiliares';
import CabeceraTabla from '../../componentes/pedidos/cabeceraTabla';
import CuerpoTabla from '../../componentes/pedidos/cuerpoTabla';
import PaginacionTabla from '../../componentes/pedidos/paginacionTabla';
import Popup from '../../componentes/pedidos/popup';
import { constantes } from '../../auxiliares/auxiliaresPedidos';
import { constantes as constantesAplicacion } from '../../auxiliares/auxiliaresAplicacion';
import MensajeInformativo from '../../componentes/comunes/mensajeInformativo';
import { ProveedorContexto } from '../../contexto/proveedor';
import { useRouter } from 'next/router';

//Componente que muestra todos los pedidos
const Pedidos = (props) => {
    const pedidos = props.pedidos;
    //los _id se guardan como cadena

    const { setRedirigirA } = useContext(ProveedorContexto); 
    const router = useRouter(); 

    const [orden, setearOrden] = useState('desc');
    //por defecto, los pedidos se ordenan según la fecha descendentemente

    //configura el criterio de ordenamiento en asc o desc para ordenar los pedidos
    const configurarOrdenamiento = () => {
        setearOrden(orden === 'asc' ? 'desc' : 'asc');
    }

    const ordenarPor = 'fecha';
    //Se pueden ordenar los pedidos por fecha y ....

    const [pagina, setearPagina] = useState(0);
    //para saber en qué página se está (empieza en la 0)

    const [filasPorPagina, setearFilasPorPagina] = useState(10);
    //por defecto se muestran 10 unidades por página

    const [openPopup, setearOpenPopup] = useState(false);
    //controla la visibilidad del popup (pregunta si se confirma la cancelación del pedido)

    const [mensaje, setMensaje] = useState(
        props.mensaje === constantes.PEDIDOS_LEIDOS_CORRECTAMENTE ?
            {
                gravedad : 'error',
                titulo : '',
                texto : '',
                mostrar : false
            }
        :
            {
                gravedad : 'error',
                titulo : constantes.ERROR,
                texto : props.mensaje || constantes.ERROR_LEER_PEDIDOS,
                mostrar : true
            }
    );
    //controla el componente MensajeInformativo

    return (        
        <>
            <Card sx = {{ marginTop : 1, width : '100%' }} >
                <Grid container spacing = {1} >
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
                                            <CabeceraTabla
                                                orden = {orden}
                                                configurarOrdenamiento = {configurarOrdenamiento}
                                            />
                                            <CuerpoTabla 
                                                ordenarPor = {ordenarPor}
                                                orden = {orden}                                                
                                                pagina = {pagina}
                                                filasPorPagina = {filasPorPagina}
                                                pedidos = {pedidos}
                                                setearOpenPopup = {setearOpenPopup}
                                            />                                
                                        </Table>
                                    </TableContainer>
                                    <PaginacionTabla 
                                        filasPorPagina = {filasPorPagina}
                                        setearFilasPorPagina = {setearFilasPorPagina}
                                        pagina = {pagina}
                                        setearPagina = {setearPagina}
                                        cantPedidos = {pedidos.length}
                                    />
                                    <Popup 
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
                                    ruta = '/pedidos'
                                />
                        }
                    </Grid>
                </Grid>
            </Card>
            <Grid container spacing = {1}>
                <Grid item xs = {12}>
                    <Button 
                        variant = 'contained' 
                        fullWidth
                        sx = {{
                            marginLeft : '0px',
                            padding : '20px 5px',
                        }}
                        onClick = { () => {  
                            setRedirigirA('pedidos/nuevo');                      
                            router.push('/pedidos/nuevo');
                        }}
                    >
                        {constantes.NUEVO_PEDIDO}
                    </Button>
                </Grid>
            </Grid>
        </>
    )
}

export const getServerSideProps = async () => {
    const resultadoObtenerPedidos = await obtenerPedidos();    
    return {
        props : {                
            pedidos: JSON.parse(JSON.stringify(resultadoObtenerPedidos.pedidos)),
            mensaje : resultadoObtenerPedidos.mensaje                
        }
    }    
    //getServerSideProps() tiene un problema al serializar el tipo de datos ObjectId de Mongo
    //Hay un hilo en GitHub al respecto (https://github.com/vercel/next.js/issues/11993)
    //Para solucionar esto se puede usar stringify() y luego parse()
    //Esta información la saqué de https://www.mongodb.com/developer/languages/javascript/nextjs-with-mongodb/
    //Lo que hay que tener en cuenta es que al usar stringify() se convierte a cadena el tipo ObjectId
    //En memoria, los _id van a estar como cadenas (hay que tener en cuenta esto para las comparaciones por ejemplo)
    //Luego, para operaciones que interactúen con la BD hay que transformarlo a ObjectId
}

export default Pedidos;

//https://plainenglish.io/blog/how-to-add-a-file-input-button-and-display-a-preview-image-with-react-2568d9d849f5
//https://stackoverflow.com/questions/40589302/how-to-enable-file-upload-on-reacts-material-ui-simple-input