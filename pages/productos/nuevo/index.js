import { useState } from 'react';
import { Container, Paper, Grid } from '@mui/material';
import { constantes } from '../../../auxiliares/auxiliaresProductos';
import EtiquetaTitulo from '../../../componentes/comunes/etiquetaTitulo';
import EtiquetaEstado from '../../../componentes/comunes/etiquetaEstado';
import CampoNombre from '../../../componentes/productos/campoNombre';
import CampoPrecio from '../../../componentes/productos/campoPrecio';
import Foto from '../../../componentes/productos/foto';
import Botones from '../../../componentes/productos/botones';
import MensajeInformativo from '../../../componentes/comunes/mensajeInformativo';
import Divisor from '../../../componentes/comunes/divisor';
import { controlarSiSeEstaLogueado } from '../../../lib/auth';
import Ingredientes from '../../../componentes/productos/ingredientes';


//Componente que permite crear un producto nuevo
const NuevoProducto = () => {
    const [nuevoProducto, setNuevoProducto ] = useState({
        //el _id lo genera MongoDB
        foto : null,
        nombre : '',
        //descripcion : '',        
        precio : 0,
        ingredientes : [
            {
                idIngrediente : null, //puede ser un ingrediente o un producto (en el caso de un combo)
                cantidad : 1,
                idUnidad : null
            }
        ],
        pedidos : []
    });
    //nuevoProducto es el producto que se está creando

    const [mensaje, setMensaje] = useState({
        gravedad : 'error',
        titulo : '',
        texto : '',
        mostrar : false
    });
    //controla el componente MensajeInformativo

    const [fotosProducto, setFotosProducto] = useState([]);
    //contiene el nombre de todas las fotos que se pudieran elegir para un producto
    //Cada vez que se selecciona una imagen distinta para la foto del producto, la misma se sube a la carpeta /public/productos
    //en el vector "fotosProducto" se van guardando cada una de estas imágenes (los nombres y ubicación de los archivos)
    //Si se cancela la operación de creación de un producto, se borran las imágenes subidas
    //Si se crea el producto, se borran todas las imágenes previas que se hubieran elegido

    //console.log(nuevoProducto);

    return (
        <Container component = "main"  sx = {{ mb: 4 }}>
            <Paper variant = "outlined" sx = {{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <EtiquetaTitulo leyenda = {constantes.PRODUCTOS} />
                <EtiquetaEstado leyenda = {constantes.NUEVO_PRODUCTO} />
                <Grid container spacing = {2} alignItems = 'center'>  
                    <Foto      
                        producto = {nuevoProducto}  
                        setProducto = {setNuevoProducto} 
                        fotosProducto = {fotosProducto}
                        setFotosProducto = {setFotosProducto}            
                    />
                    <CampoNombre 
                        leyenda = {constantes.NOMBRE}
                        producto = {nuevoProducto} 
                        setProducto = {setNuevoProducto} 
                        mostrar = {mensaje.mostrar}
                    /> 
                    <CampoPrecio 
                        leyenda = {constantes.PRECIO}
                        producto = {nuevoProducto} 
                        setProducto = {setNuevoProducto} 
                        mostrar = {mensaje.mostrar}
                    />
                    <Divisor leyenda = {constantes.INGREDIENTES}/>                     
                    <Ingredientes 
                        producto = {nuevoProducto} 
                        setProducto = {setNuevoProducto}
                        operacion = 'A'
                    />
                    <MensajeInformativo 
                        mensaje = {mensaje}
                        setMensaje = {setMensaje}
                        ruta = '/productos'
                    />                   
                    <Botones 
                        mostrar = {mensaje.mostrar}
                        producto = {nuevoProducto}
                        setMensaje = {setMensaje}
                        fotosProducto = {fotosProducto}
                        setFotosProducto = {setFotosProducto}
                        operacion = 'A'
                    />
                </Grid>
            </Paper>
        </Container>
    )
}

//No se puede crear un producto sin estar logueado
export const getServerSideProps = async (contexto) => {
    return await controlarSiSeEstaLogueado(contexto.req);
}

export default NuevoProducto;