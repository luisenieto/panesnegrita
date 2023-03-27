import { Container, Grid, Typography, Button, TextField, InputAdornment } from "@mui/material";
import { constantes } from "../../auxiliares/auxiliaresProductos";
import { constantes as constantesAplicacion } from "../../auxiliares/auxiliaresAplicacion";
import { obtenerProductos } from "../api/productos/bdAuxiliares";
import Producto from "../../componentes/productos/producto";
import { ProveedorContexto } from "../../contexto/proveedor";
import { useContext, useState } from "react";
import { useRouter } from 'next/router';
import { BsSearch } from 'react-icons/bs';
import Popup from '../../componentes/productos/popup';
import MensajeInformativo from "../../componentes/comunes/mensajeInformativo";

const Productos = (props) => {
    const productos = props.productos;
    //los _id son cadenas

    const { setRedirigirA } = useContext(ProveedorContexto);
    const router = useRouter(); 
    const [cadenaBusqueda, setCadenaBusqueda] = useState('');
    //permite mostrar sólo los productos que tengan una cierta cadena en el nombre

    const [openPopup, setearOpenPopup] = useState(false);
    //controla la visibilidad del popup (pregunta si se confirma el borrado del producto)

    const [mensaje, setMensaje] = useState(
        props.mensaje === constantes.PRODUCTOS_LEIDOS_CORRECTAMENTE ?
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
                texto : props.mensaje || constantes.ERROR_LEER_PRODUCTOS,
                mostrar : true
            }
    );
    //controla el componente MensajeInformativo

    //devuelve un vector con los productos cuyo nombre incluyan la cadena de búsqueda
    const buscarProductos = (productos) => {
        return productos.filter(producto => producto.nombre.toLowerCase().includes(cadenaBusqueda.toLowerCase()));
    }

    return (
        <Container sx = {{ marginBottom : 5, width : '100%' }}>
            <Typography variant = "h4" sx = {{ mb: 3, mt: 5 }}>
                {constantes.PRODUCTOS}
            </Typography>            
            {/* <Stack direction = "row" flexWrap = "wrap-reverse" alignItems = "center" justifyContent = "flex-end" sx = {{ mb: 5 }}>
                <Filtro 
                    mostrarFiltro = {mostrarFiltro}
                    setMostrarFiltro = {setMostrarFiltro}
                    opciones_filtrado = {OPCIONES_FILTRADO}
                    filtroElegido = {filtroElegido}
                    setFiltroElegido = {setFiltroElegido}
                    setOPCIONES_ORDENAMIENTO = {setOPCIONES_ORDENAMIENTO}
                />                    
                <Ordenamiento 
                    opciones_ordenamiento = {OPCIONES_ORDENAMIENTO}
                    ordenamientoElegido = {ordenamientoElegido}
                    setOrdenamientoElegido = {setOrdenamientoElegido}
                />
            </Stack> */}

            <Grid container spacing = {1}>
                <TextField 
                    id = "buscar-por-nombre"
                    label = "Buscar por nombre"
                    name = "buscar-por-nombre"
                    autoFocus
                    fullWidth
                    sx = {{ marginLeft : 1}}
                    InputProps = {{
                        startAdornment : (
                            <InputAdornment position = "start">
                                <BsSearch />
                            </InputAdornment>
                        )
                    }}
                    onChange = {evento => setCadenaBusqueda(evento.target.value)}
                />
                <Grid item xs = {12}>                    
                </Grid>
            </Grid>

            <Grid container spacing = {2}>
                {
                    !mensaje.mostrar ?
                        (
                            <>
                                {
                                    buscarProductos(productos).map(producto => {
                                        return (
                                            <>
                                                <Grid key = {producto._id} item xs = {6} sm = {6} md = {3}>
                                                    <Producto 
                                                        unProducto = {producto} 
                                                        setearOpenPopup = {setearOpenPopup}
                                                    />
                                                </Grid>
                                                <Popup 
                                                    titulo = {constantesAplicacion.TITULO_APLICACION}
                                                    texto = {constantes.MENSAJE_CONFIRMAR_BORRADO}
                                                    openPopup = {openPopup}
                                                    setearOpenPopup = {setearOpenPopup}
                                                    setMensaje = {setMensaje}
                                                />
                                            </>
                                        )
                                    })
                                }
                            </>
                        )
                    :
                        (
                            <MensajeInformativo 
                                mensaje = {mensaje}
                                setMensaje = {setMensaje}
                                ruta = '/productos'
                            />
                        )
                }                
            </Grid>
            <Grid container spacing = {1}>
                <Grid item xs = {12}>                    
                </Grid>
                <Grid item xs = {12}>
                    <Button 
                        variant = 'contained' 
                        fullWidth
                        sx = {{
                            marginLeft : '0px',
                            padding : '20px 5px',
                        }}
                        onClick = { () => {  
                            setRedirigirA('productos/nuevo');                      
                            router.push('/productos/nuevo');
                        }}
                    >
                        {constantes.NUEVO_PRODUCTO}
                    </Button>
                </Grid> 
                <Grid item xs = {12}>                    
                </Grid>              
            </Grid>
        </Container>
    )
}

export const getServerSideProps = async () => {
    const resultadoObtenerProductos = await obtenerProductos();
    return {
        props : {                
            productos: JSON.parse(JSON.stringify(resultadoObtenerProductos.productos)),
            mensaje : resultadoObtenerProductos.mensaje                
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


export default Productos;