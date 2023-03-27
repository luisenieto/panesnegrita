import { obtenerProductoParaModificar } from "../../api/productos/bdAuxiliares";
import { useState } from "react";
import { ObjectId } from 'mongodb';
import { constantes } from "../../../auxiliares/auxiliaresProductos";
import { Container, Paper, Grid } from '@mui/material';
import EtiquetaEstado from "../../../componentes/comunes/etiquetaEstado";
import EtiquetaTitulo from "../../../componentes/comunes/etiquetaTitulo";
import Foto from "../../../componentes/productos/foto";
import CampoNombre from "../../../componentes/productos/campoNombre";
import CampoPrecio from "../../../componentes/productos/campoPrecio";
import MensajeInformativo from "../../../componentes/comunes/mensajeInformativo";
import Botones from "../../../componentes/productos/botones";
import Divisor from "../../../componentes/comunes/divisor";
import Ingredientes from "../../../componentes/productos/ingredientes";

//Componente que permite modificar un producto
const ModificacionProducto = (props) => { 
    const [productoAModificar, setProductoAModificar] = useState(props.producto); 
    //productoAModificar es el producto que se está modificando       
    //productoAModificar._id es String

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
                titulo : 'Error',
                texto : props.mensaje,
                mostrar : true
            } 
    );
    //controla el componente MensajeInformativo

    const [fotosProducto, setFotosProducto] = useState([]);
    //contiene el nombre de todas las fotos que se pudieran elegir para un producto
    //Cada vez que se selecciona una imagen distinta para la foto del producto, la misma se sube a la carpeta /public/productos
    //en el vector "fotosProducto" se van guardando cada una de estas imágenes (los nombres y ubicación de los archivos)
    //Si se cancela la operación de creación de un producto, se borran las imágenes subidas
    //Si se crea el producto, se borran todas las imágenes previas que se hubieran elegido

    return (
        <Container component = "main"  sx = {{ mb: 4 }}>
            <Paper variant = "outlined" sx = {{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <EtiquetaTitulo leyenda = {constantes.PRODUCTOS} />
                <EtiquetaEstado leyenda = {constantes.MODIFICACION_PRODUCTO} />
                <Grid container spacing = {2} alignItems = 'center'>  
                    <Foto      
                        producto = {productoAModificar}  
                        setProducto = {setProductoAModificar} 
                        fotosProducto = {fotosProducto}
                        setFotosProducto = {setFotosProducto}            
                    />
                    <CampoNombre 
                        leyenda = {constantes.NOMBRE}
                        producto = {productoAModificar} 
                        setProducto = {setProductoAModificar} 
                        mostrar = {mensaje.mostrar}
                    /> 
                    <CampoPrecio 
                        leyenda = {constantes.PRECIO}
                        producto = {productoAModificar} 
                        setProducto = {setProductoAModificar} 
                        mostrar = {mensaje.mostrar}
                    />
                    <Divisor leyenda = {constantes.INGREDIENTES}/> 
                    <Ingredientes 
                        producto = {productoAModificar} 
                        setProducto = {setProductoAModificar}
                        operacion = 'M'
                    /> 
                    <MensajeInformativo 
                        mensaje = {mensaje}
                        setMensaje = {setMensaje}
                        ruta = '/productos'
                    />                                        
                    <Botones 
                        mostrar = {mensaje.mostrar}
                        producto = {productoAModificar}
                        setMensaje = {setMensaje}
                        fotosProducto = {fotosProducto}
                        setFotosProducto = {setFotosProducto}
                        operacion = 'M'
                    />
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
            producto : JSON.parse(JSON.stringify(resultadoObtenerProducto.producto)),               
            productos: JSON.parse(JSON.stringify(resultadoObtenerProducto.productos)),            
        }
    }    
}

export default ModificacionProducto;