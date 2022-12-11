import { Button, Box } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const Pedidos = (props) => {
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    //imagenSeleccionada es el archivo (objeto tipo File) de imagen seleccionado

    const [URLImagen, setURLImagen] = useState(null);
    //URL del archivo de imagen seleccionado (sirve para mostrarlo)

    const [imagen, setImagen] = useState(null);

    //cada vez que cambie imagenSeleccionada (objeto del tipo File)
    //se obtiene la URL del mismo mediante el método createObjectURL
    useEffect(() => {
        if (imagenSeleccionada) {
            //setURLImagen(URL.createObjectURL(imagenSeleccionada));
            const fileReader = new FileReader();
            fileReader.onload = function(evento) {
                setImagen(evento.target.result);
            }
            fileReader.readAsDataURL(imagenSeleccionada);
        }
    }, [imagenSeleccionada]);

    const handleImage = async (evento) => {
        const archivo = evento.target.files[0];
        //como se podrían seleccionar varios archivos, lo datos vienen en un vector
        //si se quiere uno solo, se toma el primer elemento del vector
        //Cada elemento del vector es un objeto del tipo File, con claves como name, size, type, lastModified, etc
        setImagenSeleccionada(archivo);

        const ruta = '/api/pedidos';
        try {
            const form = new FormData();
            form.append('imagen', archivo);
            const respuesta = await axios.post(ruta, form);
            const data = await respuesta.data;
            //console.log(data.mensaje);
            console.log(data);
        }
        catch(error) {
            //Si está definido error.response es porque se hizo el pedido y el servidor respondió con un estado !== 200
            //se puede ver error.response.data, error.response.status
            //Si está definido error.request es porque se hizo el pedido pero no se recibió una respuesta
            //se puede ver error.request
            //Y si no, el error puede ser por otra cosa
            //se puede ver error.message
            console.log(error.response.data.mensaje || error.message);
        }
    }

    return (
        //el atributo hidden de input oculta el botón y campo de texto del componente
        //el atributo accept con el valor 'image/*' permite seleccionar sólo archivos de imágenes
        //si se quisiera poder seleccionar varios archivos, se puede agregar el atributo multiple
        //el atributo type con el valor 'file' permite que el componente input sirva para seleccionar archivos
        //onChange: siempre que cambie el archivo seleccionado se lo guarda en selectedImage        
        <>
            <Button variant="contained" component="label">
                Upload
                <input hidden accept = 'image/*' multiple type = 'file' onChange = {handleImage} />
            </Button>
            {
                imagen && (
                    <Box mt={2} textAlign="center">
                        <img src = {imagen} height = "100px" />
                    </Box>
                )                
            }
            {/* {
                URLImagen && imagenSeleccionada && (
                    <Box mt={2} textAlign="center">
                        <img src = {URLImagen} alt = {imagenSeleccionada.name} height = "100px"/>
                    </Box>
                )
            } */}

        </>
    )
}

export default Pedidos;

//https://plainenglish.io/blog/how-to-add-a-file-input-button-and-display-a-preview-image-with-react-2568d9d849f5
//https://stackoverflow.com/questions/40589302/how-to-enable-file-upload-on-reacts-material-ui-simple-input