import { Grid, Button } from "@mui/material";
import { useTheme } from '@emotion/react';
import { constantes } from "../../auxiliares/auxiliaresProductos";
import { useRouter } from 'next/router';
import { borrarLaFotoElegida, borrarDuplicados } from "../../auxiliares/auxiliaresProductos";
import axios from "axios";

//Componente que muestra los botones "Aceptar" y "Cancelar" cuando se crea/modifica un producto
const Botones = ({mostrar, producto, setMensaje, fotosProducto, setFotosProducto, operacion}) => {

    const tema = useTheme();
    const router = useRouter();

    const handleCancelar = async () => {
        const fotosSinDuplicados = borrarDuplicados(fotosProducto);

        const ruta = '/api/fotosProducto/borrar';
        try {
            const respuesta = await axios({
                url : ruta,
                method: 'post',
                data: fotosSinDuplicados
            });
            const data = await respuesta.data;
            //console.log(data.mensaje);
        }
        catch(error) {
            console.log(error);
        }

        //Se limpia el vector de fotos
        setFotosProducto([]);

        router.push('/productos');
    }

    const handleAceptar = async () => {
        const ruta = '/api/productos/';
        if (operacion === 'A') { //nuevo producto
            try {
                const respuesta = await axios.post(ruta, {...producto, operacion });
                const data = await respuesta.data;
                if (data.mensaje === constantes.PRODUCTO_CREADO) {
                    //Se borran los archivos de imágenes innecesarios
                    const fotosSinDuplicados = borrarDuplicados(fotosProducto);
                    const fotossSinDuplicadosYSinElElegido = borrarLaFotoElegida(fotosSinDuplicados, producto.foto);
                    const rutaBorrar = '/api/fotosProducto/borrar';
                    try {
                        await axios({
                            url : rutaBorrar,
                            method: 'post',
                            data: fotossSinDuplicadosYSinElElegido
                        });
                    }
                    catch(error) {
                        console.log(error);
                    }

                    //Se limpia el vector de fotos
                    setFotosProducto([]);

                    setMensaje({
                        gravedad : 'success',
                        titulo : constantes.NUEVO_PRODUCTO,
                        texto : data.mensaje,
                        mostrar : true
                    });
                }
                else {
                    setMensaje({
                        gravedad : 'error',
                        titulo : constantes.NUEVO_PRODUCTO,
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
                    titulo : constantes.NUEVO_PRODUCTO,
                    //texto : error.response.data.mensaje || error.message,
                    texto : 'error',
                    mostrar : true
                });                               
            }
        }
        else { //modificación producto
            try {                
                const respuesta = await axios.post(ruta, {...producto, operacion });
                const data = await respuesta.data;
                if (data.mensaje === constantes.PRODUCTO_MODIFICADO) {
                    setMensaje({
                        gravedad : 'success',
                        titulo : constantes.MODIFICACION_PRODUCTO,
                        texto : data.mensaje,
                        mostrar : true
                    });
                }
                else {
                    setMensaje({
                        gravedad : 'error',
                        titulo : constantes.MODIFICACION_PRODUCTO,
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
                disabled = {mostrar || producto.nombre === '' ? true : false}
            >
                {constantes.ACEPTAR}
            </Button>
        </Grid>
    )
}

export default Botones;