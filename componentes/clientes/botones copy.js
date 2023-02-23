import { Grid, Button } from "@mui/material";
import { useTheme } from '@emotion/react';
import { constantes } from "../../auxiliares/auxiliaresClientes";
import { useRouter } from 'next/router';
import axios from "axios";

const Botones = ({mostrar, cliente, setMensaje, avatars, setAvatars, operacion}) => {

    const tema = useTheme();
    const router = useRouter();

    //borra los elementos duplicados del vector
    //Suponer que se selecciona el archivo "1" como imagen para el avatar
    //luego el archivo "2", luego el "3", luego el "2" nuevamente y finalmente el "1"
    //El archivo avatars valdría: ["1", "2", "3", "2", "1"]
    //Luego de llamar a esta función, el archivo valdría: ["1", "2", "3"]
    //Este es el vector que se le pasará a la API encargada de borrar los archivos innecesarios
    //cuando se cancele la operación
    const borrarDuplicados = (vector) => {
        return vector.filter((item, indice) => vector.indexOf(item) === indice);
    }

    //borra el avatar elegido del vector
    //Suponer que se selecciona el archivo "1" como imagen para el avatar
    //luego el archivo "2", luego el "3", luego el "2" nuevamente y finalmente el "1"
    //El archivo avatars valdría: ["1", "2", "3", "2", "1"]
    //Luego de llamar a esta función, el archivo valdría: ["2", "3"]
    //Este es el vector que se le pasará a la API encargada de borrar los archivos innecesarios
    //cuando se cree el cliente (no tiene que borrar el archivo "1" ya que es la foto que se eligió finalmente)
    const borrarElAvatarElegido = (vector, avatar) => {
        //console.log(avatar);
        return vector.filter(item => item !== avatar);
    }

    const handleCancelar = async () => {
        const avatarsSinDuplicados = borrarDuplicados(avatars);

        const ruta = '/api/avatars/borrar';
        try {
            const respuesta = await axios({
                url : ruta,
                method: 'post',
                data: avatarsSinDuplicados
            });
            const data = await respuesta.data;
            //console.log(data.mensaje);
        }
        catch(error) {
            console.log(error);
        }
        setAvatars([]);
        router.push('/clientes');
    }

    const handleAceptar = async () => {
        const rutaCrear = '/api/clientes/';
        if (operacion === 'A') { //nuevo cliente

            // console.log(cliente);
            // router.push('/clientes');  

            try {
                const respuesta = await axios.post(rutaCrear, {...cliente, operacion });
                const data = await respuesta.data;
                if (data.mensaje === constantes.CLIENTE_CREADO) {

                    //Se borran los archivos de imágenes innecesarios
                    const avatarsSinDuplicados = borrarDuplicados(avatars);
                    const avatarsSinDuplicadosYSinElElegido = borrarElAvatarElegido(avatarsSinDuplicados, cliente.foto);
                    const rutaBorrar = '/api/avatars/borrar';
                    try {
                        await axios({
                            url : rutaBorrar,
                            method: 'post',
                            data: avatarsSinDuplicadosYSinElElegido
                        });
                    }
                    catch(error) {
                        console.log(error);
                    }

                    //Se limpia el vector de avatars
                    setAvatars([]);
                    setMensaje({
                        gravedad : 'success',
                        titulo : constantes.NUEVO_CLIENTE,
                        texto : data.mensaje,
                        mostrar : true
                    });
                }
                else {
                    setMensaje({
                        gravedad : 'error',
                        titulo : constantes.NUEVO_CLIENTE,
                        texto : data.mensaje,
                        mostrar : true
                    });
                }
            }
            catch(error) {
                //Si está definido error.response es porque se hizo el pedido y el servidor respondió con un estado !== 200
                //se puede ver error.response.data, error.response.status
                //Si está definido error.request es porque se hizo el pedido pero no se recibió una respuesta
                //se puede ver error.request
                //Y si no, el error puede ser por otra cosa
                //se puede ver error.message
                setMensaje({
                    gravedad : 'error',
                    titulo : constantes.NUEVO_CLIENTE,
                    //texto : error.response.data.mensaje || error.message,
                    texto : 'error',
                    mostrar : true
                });                               
            }
        }
        else { //modificación ingrediente
            try {                
                const respuesta = await axios.post(ruta, {...cliente, operacion });
                const data = await respuesta.data;
                if (data.mensaje === constantes.CLIENTE_MODIFICADO) {
                    setMensaje({
                        gravedad : 'success',
                        titulo : constantes.MODIFICACION_CLIENTE,
                        texto : data.mensaje,
                        mostrar : true
                    });
                }
                else {
                    setMensaje({
                        gravedad : 'error',
                        titulo : constantes.MODIFICACION_CLIENTE,
                        texto : data.mensaje,
                        mostrar : true
                    });                    
                }
            }
            catch(error) {
                setMensaje({
                    gravedad : 'error',
                    titulo : 'Error',
                    texto : error.response.data.mensaje || error.message,
                    mostrar : true
                }); 
            }
        }
    }

    return (
        <Grid container direction = 'row-reverse' sx = {{marginTop : 2}}> 
            <Button 
                sx = {{color : tema.palette.secondary.main}}
                disabled = {mostrar}
                onClick = {handleCancelar}
            >
                {constantes.CANCELAR}
            </Button>
            <Button 
                sx = {{color : tema.palette.secondary.main}}
                onClick = {handleAceptar}
                disabled = {mostrar || cliente.nombre === '' || cliente.referencia === '' ? true : false}
            >
                {constantes.ACEPTAR}
            </Button>
        </Grid>
    )
}

export default Botones;