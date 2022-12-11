import { Grid, Button } from "@mui/material";
import { useTheme } from '@emotion/react';
import { constantes } from "../../auxiliares/auxiliaresIngredientes";
import { useRouter } from 'next/router';
import axios from "axios";

const Botones = ({mostrar, ingrediente, setMensaje, operacion}) => {

    const tema = useTheme();
    const router = useRouter();

    const handleCancelar = () => {
        router.push('/ingredientes');
    }

    const handleAceptar = async () => {
        const ruta = '/api/ingredientes/';
        if (operacion === 'A') { //nuevo ingrediente
            try {
                const respuesta = await axios.post(ruta, {...ingrediente, operacion });
                const data = await respuesta.data;
                if (data.mensaje === constantes.INGREDIENTE_CREADO) {
                    setMensaje({
                        gravedad : 'success',
                        titulo : constantes.NUEVO_INGREDIENTE,
                        texto : data.mensaje,
                        mostrar : true
                    });
                }
                else {
                    setMensaje({
                        gravedad : 'error',
                        titulo : constantes.NUEVO_INGREDIENTE,
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
                    titulo : constantes.NUEVO_INGREDIENTE,
                    //texto : error.response.data.mensaje || error.message,
                    texto : 'error',
                    mostrar : true
                });                               
            }
        }
        else { //modificación ingrediente
            try {                
                const respuesta = await axios.post(ruta, {...ingrediente, operacion });
                const data = await respuesta.data;
                if (data.mensaje === constantes.INGREDIENTE_MODIFICADO) {
                    setMensaje({
                        gravedad : 'success',
                        titulo : constantes.MODIFICACION_INGREDIENTE,
                        texto : data.mensaje,
                        mostrar : true
                    });
                }
                else {
                    setMensaje({
                        gravedad : 'error',
                        titulo : constantes.MODIFICACION_INGREDIENTE,
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
                disabled = {mostrar || ingrediente.nombre === '' || ingrediente.idUnidad === null ? true : false}
            >
                {constantes.ACEPTAR}
            </Button>
        </Grid>
    )
}

export default Botones;