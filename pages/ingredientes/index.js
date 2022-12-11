import { obtenerIngredientes } from "../api/ingredientes/bdAuxiliares";
import { Grid, TableContainer, Table, Card, Button } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import CabeceraTabla from '../../componentes/ingredientes/cabeceraTabla';
import CuerpoTabla from "../../componentes/ingredientes/cuerpoTabla";
import PaginacionTabla from "../../componentes/ingredientes/paginacionTabla";
import { constantes } from "../../auxiliares/auxiliaresIngredientes";
import { useRouter } from 'next/router';
import axios from 'axios';
import { ProveedorContexto } from "../../contexto/proveedor";
import Popup from "../../componentes/ingredientes/popup";

const Ingredientes = (props) => {
    const { unidades, setUnidades, setRedirigirA } = useContext(ProveedorContexto); 

    const router = useRouter(); 

    const ingredientes = props.ingredientes;
    //los _id se guardan como cadena

    const ordenarPor = 'nombre';
    //sólo se pueden ordenar los ingredientes por su nombre

    const [orden, setearOrden] = useState('asc');
    //por defecto, los ingredientes se ordenan alfabéticamente

    //configura el criterio de ordenamiento en asc o desc para ordenar los ingredientes
    const configurarOrdenamiento = () => {
        setearOrden(orden === 'asc' ? 'desc' : 'asc');
    }

    const [pagina, setearPagina] = useState(0);
    //para saber en qué página se está (empieza en la 0)

    const [filasPorPagina, setearFilasPorPagina] = useState(10);
    //por defecto se muestran 10 unidades por página

    const [openPopup, setearOpenPopup] = useState(false);
    //controla la visibilidad del popup (pregunta si se confirma el borrado del ingrediente)

    //la obtención de las unidades se la tiene que hacer dentro del hook useEffect
    //porque el método obtenerUnidades() es async, y por lo tanto al llamarlo habría que usar await
    //para poder usar await, el componente AutoCompletarUnidad debería definirse como async
    //pero eso no se puede
    useEffect(() => {        
        //Si todavía no se leyeron las unidades, se las lee
        if (unidades.length === 0) {            
            //Obtiene las unidades. Si hubo algún error devuelve un vector vacío
            const obtenerUnidades = async () => {
                const ruta = '/api/unidades/';
                try {
                    const respuesta = await axios.get(ruta);
                    const data = await respuesta.data;  
                    setUnidades(data.unidades);
                    //los _id son cadenas
                }
                catch(error) {
                    setUnidades([]);
                }
            }
            obtenerUnidades();
        }        
    }, []);    

    const [mensaje, setMensaje] = useState(
        props.mensaje === constantes.INGREDIENTES_LEIDOS_CORRECTAMENTE ?
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
                texto : props.mensaje || constantes.ERROR_LEER_INGREDIENTES,
                mostrar : true
            }
    );
    //controla el componente MensajeInformativo

    return (
        <>
            <Card sx = {{ marginTop : 1, width : '100%' }} >
                <Grid container spacing = {1} >
                    <Grid item xs = {12}>
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
                                    ingredientes = {ingredientes}
                                    setearOpenPopup = {setearOpenPopup}
                                />
                            </Table>
                        </TableContainer>
                        <PaginacionTabla 
                            filasPorPagina = {filasPorPagina}
                            setearFilasPorPagina = {setearFilasPorPagina}
                            pagina = {pagina}
                            setearPagina = {setearPagina}
                            cantIngredientes = {ingredientes.length}
                        />
                        <Popup 
                            titulo = {constantes.TITULO_APLICACION}
                            texto = {constantes.MENSAJE_CONFIRMAR_BORRADO}
                            openPopup = {openPopup}
                            setearOpenPopup = {setearOpenPopup}
                            setMensaje = {setMensaje}
                        />
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
                            setRedirigirA('ingredientes/nuevo');                      
                            router.push('/ingredientes/nuevo');
                        }}
                    >
                        {constantes.NUEVO_INGREDIENTE}
                    </Button>
                </Grid>
            </Grid>
        </>
    )
}

export const getServerSideProps = async () => {
    const resultadoObtenerIngredientes = await obtenerIngredientes();
    return {
        props : {                
            ingredientes: JSON.parse(JSON.stringify(resultadoObtenerIngredientes.ingredientes)),
            mensaje : resultadoObtenerIngredientes.mensaje                
        }
    }    
    
}

export default Ingredientes;