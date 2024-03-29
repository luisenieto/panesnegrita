import { Grid, Button } from "@mui/material";
import { useTheme } from '@emotion/react';
import { constantes } from "../../auxiliares/auxiliaresClientes";
import { useRouter } from 'next/router';
import axios from "axios";

const Botones = ({mostrar, cliente, setMensaje, operacion}) => {

    const tema = useTheme();
    const router = useRouter();

    const handleCancelar = async () => {
        router.push('/clientes');
    }

    const handleAceptar = async () => {
        const ruta = '/api/clientes/';
        if (operacion === 'A') { //nuevo cliente
            try {
                const respuesta = await axios.post(ruta, {...cliente, operacion });
                const data = await respuesta.data;
                if (data.mensaje === constantes.CLIENTE_CREADO) {
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
                console.log(error);
                setMensaje({
                    gravedad : 'error',
                    titulo : 'Error',
                    //texto : error.response.data.mensaje || error.message,
                    texto : 'error',
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
                disabled = {mostrar || cliente.nombre === '' || cliente.apellido === '' || cliente.referencia === '' ? true : false}
            >
                {constantes.ACEPTAR}
            </Button>
        </Grid>
    )
}

export default Botones;