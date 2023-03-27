import { obtenerClientes } from "../api/clientes/bdAuxiliares";
import { Grid, TableContainer, Table, Card, Button } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { ProveedorContexto } from "../../contexto/proveedor";
import { useRouter } from 'next/router';
import { constantes } from "../../auxiliares/auxiliaresClientes";
import { constantes as contantesAplicacion } from "../../auxiliares/auxiliaresAplicacion";
import CabeceraTabla from "../../componentes/clientes/cabeceraTabla";
import CuerpoTabla from "../../componentes/clientes/cuerpoTabla";
import PaginacionTabla from "../../componentes/clientes/paginacionTabla";
import Popup from '../../componentes/clientes/popup';
import MensajeInformativo from "../../componentes/comunes/mensajeInformativo";

//Componente que muestra todos los clientes
const Clientes = (props) => {    
    const { setClientes, setRedirigirA } = useContext(ProveedorContexto); 
    const router = useRouter(); 

    const clientes = props.clientes;
    //los _id se guardan como cadena

    useEffect(() => {
        if (clientes)
            setClientes(clientes);
    }, []); //eslint-disable-line react-hooks/exhaustive-deps 
    //el comentario anterior es para que en la consola no aparezca el warning diciendo que el array de depdencias de useEffect está vacío
    //se cargan en memoria los clientes. Esto le sirve a componentes como ... por ejemplo

    const ordenarPor = 'nombre';
    //sólo se pueden ordenar los clientes por su nombre

    const [orden, setearOrden] = useState('asc');
    //por defecto, los clientes se ordenan alfabéticamente

    //configura el criterio de ordenamiento en asc o desc para ordenar los ingredientes
    const configurarOrdenamiento = () => {
        setearOrden(orden === 'asc' ? 'desc' : 'asc');
    }

    const [pagina, setearPagina] = useState(0);
    //para saber en qué página se está (empieza en la 0)

    const [filasPorPagina, setearFilasPorPagina] = useState(10);
    //por defecto se muestran 10 clientes por página

    const [openPopup, setearOpenPopup] = useState(false);
    //controla la visibilidad del popup (pregunta si se confirma el borrado del ingrediente)

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
                titulo : constantes.ERROR,
                texto : props.mensaje || constantes.ERROR_LEER_CLIENTES,
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
                                                clientes = {clientes}
                                                setearOpenPopup = {setearOpenPopup}
                                            />
                                        </Table>
                                    </TableContainer>
                                    <PaginacionTabla 
                                        filasPorPagina = {filasPorPagina}
                                        setearFilasPorPagina = {setearFilasPorPagina}
                                        pagina = {pagina}
                                        setearPagina = {setearPagina}
                                        cantClientes = {clientes.length}
                                    />
                                    <Popup 
                                        titulo = {contantesAplicacion.TITULO_APLICACION}
                                        texto = {constantes.MENSAJE_CONFIRMAR_BORRADO}
                                        openPopup = {openPopup}
                                        setearOpenPopup = {setearOpenPopup}
                                        setMensaje = {setMensaje}
                                    />
                                </>
                            :
                                <MensajeInformativo 
                                    mensaje = {mensaje}
                                    setMensaje = {setMensaje}
                                    ruta = '/clientes'
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
                            setRedirigirA('clientes/nuevo');                      
                            router.push('/clientes/nuevo');
                        }}
                    >
                        {constantes.NUEVO_CLIENTE}
                    </Button>
                </Grid>
            </Grid>
        </>
    )
}

export const getServerSideProps = async () => {
    const resultadoObtenerClientes = await obtenerClientes();
    return {
        props : {                
            clientes: JSON.parse(JSON.stringify(resultadoObtenerClientes.clientes)),
            mensaje : resultadoObtenerClientes.mensaje                
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

export default Clientes;