import { Grid, IconButton } from '@mui/material';
import { constantes } from '../../auxiliares/auxiliaresClientes';
import axios from 'axios';

//Componente que muestra la foto para crear/modificar un cliente
const Foto = ({cliente, setCliente, avatars, setAvatars}) => {

    const handleImage = async (evento) => {
        //const archivo = constantes.RUTA_AVATARS + evento.target.files[0].name;

        const ruta = '/api/avatars/subir';
        try {
            const form = new FormData();
            form.append('imagen', evento.target.files[0]);
            //Los datos vienen en un vector, y como se quiere seleccionar uno único archivo, se toma el primer elemento del vector
            //Cada elemento del vector es un objeto del tipo File, con claves como name, size, type, lastModified, etc        

            const respuesta = await axios.post(ruta, form);
            const data = await respuesta.data;
            if (data.archivo) {
                var arrayDeCadenas = data.archivo.split("/");

                const archivo = constantes.RUTA_AVATARS + arrayDeCadenas[arrayDeCadenas.length - 1];
                //arrayDeCadenas[arrayDeCadenas.length - 1] tiene el nombre del archivo subido
                const avatarsUpdate = [...avatars];
                avatarsUpdate.push(archivo);
                setAvatars(avatarsUpdate);
                //cada vez que se selecciona una imagen distinta para el avatar, la misma se sube a la carpeta /public/avatars
                //en el vector "avatars" se van guardando cada una de estas imágenes (los nombres y ubicación de los archivos)
                //Si se cancela la operación de creación de un cliente, se borran las imágenes subidas
                //Si se crea el cliente, se borran todas las imágenes previas que se hubieran elegido

                setCliente({...cliente, 'foto' : archivo});  
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
                <img src = {cliente.foto ? cliente.foto : constantes.AVATAR_PREDETERMINADO} alt = 'zz' height = {64} width = {64}/>
                <input hidden accept = 'image/*' type = 'file' onChange = {handleImage} />
            </IconButton>
        </Grid>
    )
}

export default Foto;