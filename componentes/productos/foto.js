import { Grid, IconButton } from '@mui/material';
import { constantes } from '../../auxiliares/auxiliaresProductos';
import axios from 'axios';

//Componente que muestra la foto para crear/modificar un producto
const Foto = ({ producto, setProducto, fotosProducto, setFotosProducto }) => {

    const handleImage = async (evento) => {
        //const archivo = constantes.RUTA_AVATARS + evento.target.files[0].name;

        const ruta = '/api/fotosProducto/subir';
        try {
            const form = new FormData();
            form.append('imagen', evento.target.files[0]);
            //Los datos vienen en un vector, y como se quiere seleccionar uno único archivo, se toma el primer elemento del vector
            //Cada elemento del vector es un objeto del tipo File, con claves como name, size, type, lastModified, etc        

            const respuesta = await axios.post(ruta, form);
            const data = await respuesta.data;
            if (data.archivo) {
                //data.archivo: /var/www/html/panesnegrita/public/productos/WhatsApp.jpg
                var arrayDeCadenas = data.archivo.split("/");

                const archivo = constantes.RUTA_FOTOS_PRODUCTOS + arrayDeCadenas[arrayDeCadenas.length - 1];
                //arrayDeCadenas[arrayDeCadenas.length - 1] tiene el nombre del archivo subido
                //archivo: /productos/WhatsApp.jpg
                const fotosProductoUpdate = [...fotosProducto];
                fotosProductoUpdate.push(archivo);
                setFotosProducto(fotosProductoUpdate);
                //Cada vez que se selecciona una imagen distinta para la foto del producto, la misma se sube a la carpeta /public/productos
                //en el vector "fotosProducto" se van guardando cada una de estas imágenes (los nombres y ubicación de los archivos)
                //Si se cancela la operación de creación de un producto, se borran las imágenes subidas
                //Si se crea el producto, se borran todas las imágenes previas que se hubieran elegido

                setProducto({...producto, 'foto' : archivo});  
            }
        }
        catch(error) {
            //Si está definido error.response es porque se hizo el pedido y el servidor respondió con un estado !== 200
            //se puede ver error.response.data, error.response.status
            //Si está definido error.request es porque se hizo el pedido pero no se recibió una respuesta
            //se puede ver error.request
            //Y si no, el error puede ser por otra cosa
            //se puede ver error.message
            console.log(error);
        }
    }

    return (
        <Grid item lg = {12} sm = {12} xs = {12}>
            <IconButton aria-label="upload picture" component="label">
                <img src = {producto.foto ? producto.foto : constantes.FOTO_PREDETERMINADA} alt = 'zz' height = {64} width = {64}/>
                <input hidden accept = 'image/*' type = 'file' onChange = {handleImage} />
            </IconButton>
        </Grid>
    )
}

export default Foto;