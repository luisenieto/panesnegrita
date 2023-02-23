import { Grid, Button } from "@mui/material";
import { useTheme } from '@emotion/react';
import { constantes } from "../../auxiliares/auxiliaresProductos";
import { useRouter } from 'next/router';
import axios from "axios";

//Componente que muestra los botones "Aceptar" y "Cancelar" cuando se hace un nuevo pedido de un producto
const BotonesPedidos = ({ pedido, setMensaje }) => {

    const tema = useTheme();
    const router = useRouter();

    const handleCancelar = async () => {
        router.push('/productos');
    }

    const handleAceptar = async () => {
        const ruta = '/api/pedidos/';

        try {
            const respuesta = await axios.post(ruta, {...pedido, operacion : 'A' });
            const data = await respuesta.data;
            if (data.mensaje === constantes.PEDIDO_CREADO) {                
                setMensaje({
                    gravedad : 'success',
                    titulo : constantes.NUEVO_PEDIDO,
                    texto : data.mensaje,
                    mostrar : true
                });
            }
            else {
                setMensaje({
                    gravedad : 'error',
                    titulo : constantes.NUEVO_PEDIDO,
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
                titulo : constantes.NUEVO_PEDIDO,
                //texto : error.response.data.mensaje || error.message,
                texto : 'error',
                mostrar : true
            });                               
        }
    }

    return (
        <Grid container direction = 'row-reverse' sx = {{marginTop : 2}}> 
            <Button 
                sx = {{color : tema.palette.secondary.main}}
                //disabled = {mostrar}
                onClick = {handleCancelar}
            >
                {constantes.CANCELAR}
            </Button>
            <Button 
                sx = {{color : tema.palette.secondary.main}}
                onClick = {handleAceptar}
                disabled = {!pedido.idCliente || pedido.cantidad === 0 || pedido.importe === 0 ? true : false}
            >
                {constantes.ACEPTAR}
            </Button>
        </Grid>
    )
}

export default BotonesPedidos;