import { Grid, TableContainer, Table, Card, Button } from '@mui/material';
import CabeceraTabla from '../../componentes/unidades/cabeceraTabla';
import CuerpoTabla from '../../componentes/unidades/cuerpoTabla';
import PaginacionTabla from '../../componentes/unidades/paginacionTabla';
import MensajeInformativo from '../../componentes/unidades/mensajeInformativo';
import { useRouter } from 'next/router';
import { useState, useEffect, useContext } from 'react';
import { ProveedorContexto } from '../../contexto/proveedor';
import { constantes } from '../../auxiliares/auxiliaresUnidades';
import { obtenerUnidades } from '../api/unidades/bdAuxiliares';
import Popup from '../../componentes/unidades/popup';

//componente que muestra las unidades definidas
const Unidades = (props) => {    
    const unidades = props.unidades;
    //los _id se guardan como cadena
    
    const { setUnidades, setRedirigirA } = useContext(ProveedorContexto);
    
    useEffect(() => {
        if (unidades)
            setUnidades(unidades);
    }, []); //eslint-disable-line react-hooks/exhaustive-deps 
    //el comentario anterior es para que en la consola no aparezca el warning diciendo que el array de depdencias de useEffect está vacío
    //se cargan en memoria las unidades. Esto le sirve a componentes como Equivalencia por ejemplo
    
    const [mensaje, setMensaje] = useState(
        props.mensaje === constantes.UNIDADES_LEIDAS_CORRECTAMENTE ?
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
                texto : props.mensaje || constantes.ERROR_LEER_UNIDADES,
                mostrar : true
            }
    );
    //controla el componente MensajeInformativo
    
    const router = useRouter();
    const ordenarPor = 'nombre';
    //sólo se pueden ordenar las unidades por su nombre

    const [orden, setearOrden] = useState('asc');
    //por defecto, las unidades se ordenan alfabéticamente

    const [filasPorPagina, setearFilasPorPagina] = useState(10);
    //por defecto se muestran 10 unidades por página

    const [pagina, setearPagina] = useState(0);
    //para saber en qué página se está (empieza en la 0)

    //configura el criterio de ordenamiento en asc o desc para ordenar las unidades
    const configurarOrdenamiento = () => {
        setearOrden(orden === 'asc' ? 'desc' : 'asc');
    }

    const [openPopup, setearOpenPopup] = useState(false);
    //controla la visibilidad del popup (pregunta si se confirma el borrado de la unidad)

    //falta el caso que hubiera error al conectarse/leer de la BD
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
                                                unidades = {unidades}
                                                setearOpenPopup = {setearOpenPopup}
                                            />
                                        </Table>
                                    </TableContainer>
                            
                                    <PaginacionTabla 
                                        filasPorPagina = {filasPorPagina}
                                        setearFilasPorPagina = {setearFilasPorPagina}
                                        pagina = {pagina}
                                        setearPagina = {setearPagina}
                                        cantUnidades = {unidades.length}
                                    />
                                    <Popup 
                                        titulo = {constantes.TITULO_APLICACION}
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
                                />
                        }                        
                    </Grid>                
                </Grid>
            </Card>
            {
                unidades !== null &&
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
                                    setRedirigirA('/unidades/nueva');                      
                                    router.push('/unidades/nueva');
                                }}
                            >
                                {constantes.NUEVA_UNIDAD}
                            </Button>
                        </Grid>
                    </Grid>                
            }            
        </>
    )
}

export const getServerSideProps = async () => {
    const resultadoObtenerUnidades = await obtenerUnidades();  
    //getServerSideProps() se ejecuta en el servidor
    //Si se hiciera una llamada a la API (interna), la misma también se ejecuta en el servidor
    //con lo cual se estaría haciendo un pedido del servidor a él mismo (no tiene sentido)
    //Por esta razón no se usa axios/fetch en getServerSideProps y en su lugar se llama a una función 
    //Esta función se ejecuta en el servidor, por lo que está definida dentro de /api
    return {
        props : {                
            unidades: JSON.parse(JSON.stringify(resultadoObtenerUnidades.unidades)),
            mensaje : resultadoObtenerUnidades.mensaje                
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

export default Unidades;