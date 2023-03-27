import { ObjectId } from 'mongodb';
import { obtenerProductoParaModificar } from '../../api/productos/bdAuxiliares';
import { useState } from 'react';
import { Container, Paper, Grid, TableContainer, Table, Button } from '@mui/material';
import EtiquetaTitulo from '../../../componentes/comunes/etiquetaTitulo';
import EtiquetaEstado from '../../../componentes/comunes/etiquetaEstado';
import { constantes } from '../../../auxiliares/auxiliaresPedidos';
import { moneda } from '../../../auxiliares/auxiliares';
import CabeceraTabla from '../../../componentes/pedidos/cabeceraTabla';
import CuerpoTabla from '../../../componentes/pedidos/cuerpoTabla';
import PaginacionTabla from '../../../componentes/pedidos/paginacionTabla';
import { useRouter } from 'next/router';

//Componente que muestra los pedidos de un producto
const Pedidos = (props) => {
    const [producto, setProducto] = useState(props.producto); 
    //producto es el producto al que se está mostrando los pedidos
    //producto._id es String

    const router = useRouter();

    const [orden, setearOrden] = useState('asc');
    //por defecto, los ... se ordenan alfabéticamente

    //configura el criterio de ordenamiento en asc o desc para ordenar los ingredientes
    const configurarOrdenamiento = () => {
        setearOrden(orden === 'asc' ? 'desc' : 'asc');
    }

    const ordenarPor = 'nombre';
    //sólo se pueden ordenar los pedidos por su ....

    const [pagina, setearPagina] = useState(0);
    //para saber en qué página se está (empieza en la 0)

    const [filasPorPagina, setearFilasPorPagina] = useState(10);
    //por defecto se muestran 10 clientes por página

    return (
        <Container component = "main"  sx = {{ mb: 4 }}>
            <Paper variant = "outlined" sx = {{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <EtiquetaTitulo leyenda = {constantes.PEDIDOS} />
                <EtiquetaEstado leyenda = {`${producto.nombre} | ${moneda(producto.precio)}`} />
                <Grid container spacing = {1}>
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
                                    producto = {producto}
                                    setProducto = {setProducto}
                                    //setearOpenPopup = {setearOpenPopup}
                                />
                            </Table>
                        </TableContainer>
                        <PaginacionTabla 
                            filasPorPagina = {filasPorPagina}
                            setearFilasPorPagina = {setearFilasPorPagina}
                            pagina = {pagina}
                            setearPagina = {setearPagina}
                            cantPedidos = {producto.pedidos.length}
                        />
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
                                onClick = {() => router.push('/productos')}
                            >
                                {constantes.CANCELAR}
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

export default Pedidos;