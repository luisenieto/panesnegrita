import { Container, Paper, Grid, Button } from '@mui/material';
import EtiquetaTitulo from '../../../componentes/comunes/etiquetaTitulo'
import EtiquetaEstado from '../../../componentes/comunes/etiquetaEstado';
import CampoUnidad from '../../../componentes/unidades/campoUnidad';
import Equivalencias from '../../../componentes/unidades/equivalencias';
import { useState, useEffect } from 'react';
import { useTheme } from '@emotion/react';
import { useRouter } from 'next/router';
//import MensajeInformativo from '../../../componentes/unidades/mensajeInformativo';
import MensajeInformativo from '../../../componentes/comunes/mensajeInformativo';
import axios from 'axios';
import { constantes } from '../../../auxiliares/auxiliaresUnidades';
import { controlarSiSeEstaLogueado } from '../../../lib/auth';

//Componente que permite crear una nueva unidad
const NuevaUnidad = (props) => {    

    //const { unidades, setUnidades } = useContext(ProveedorContexto);
    const router = useRouter();
    const tema = useTheme();

    const [nuevaUnidad, setNuevaUnidad ] = useState({
        //el _id lo genera MongoDB
        nombre : '',
        equivalencias : []
    });
    //nuevaUnidad es la unidad que se está creando

    const [mensaje, setMensaje] = useState({
        gravedad : 'error',
        titulo : '',
        texto : '',
        mostrar : false
    });
    //controla el componente MensajeInformativo

    //se ejecuta cuando se selecciona Cancelar
    const handleCancelar = () => {
        router.push('/unidades');
    }

    //se ejecuta cuando se selecciona Aceptar
    const handleAceptar = async () => {
        const ruta = '/api/unidades/';
        try {
            const respuesta = await axios.post(ruta, {...nuevaUnidad, operacion : 'A' });
            const data = await respuesta.data;
            if (data.mensaje === constantes.UNIDAD_CREADA) {
                setMensaje({
                    gravedad : 'success',
                    titulo : constantes.NUEVA_UNIDAD,
                    texto : data.mensaje,
                    mostrar : true
                });
            }
            else {
                setMensaje({
                    gravedad : 'error',
                    titulo : constantes.NUEVA_UNIDAD,
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
                titulo : 'Error',
                texto : error.response.data.mensaje || error.message,
                mostrar : true
            });                               
        }    
    }

    //mb: margin-bottom
    //my: margin-top, margin-bottom
    //p: padding
    //py: padding-top, padding-bottom
    //px: padding-left, padding-right
    return (
        <Container component = "main" maxWidth = "sm" sx = {{ mb: 4 }}>
            <Paper variant = "outlined" sx = {{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <EtiquetaTitulo leyenda = 'Unidades' />
                <EtiquetaEstado leyenda = 'Nueva unidad' />
                <Grid container spacing = {3}>
                    <CampoUnidad 
                        leyenda = 'Nombre de la unidad' 
                        unidad = {nuevaUnidad} 
                        setUnidad = {setNuevaUnidad} 
                        mostrar = {mensaje.mostrar}
                    />
                    <MensajeInformativo 
                        mensaje = {mensaje}
                        setMensaje = {setMensaje}
                        ruta = '/unidades'
                    />
                    <Equivalencias 
                        leyenda = 'Equivalencias' 
                        unidad = {nuevaUnidad}
                        setUnidad = {setNuevaUnidad}
                        mostrar = {mensaje.mostrar}
                    />
                    <Grid container direction = 'row-reverse' sx = {{marginTop : 2}}>                        
                        <Button 
                            sx = {{color : tema.palette.secondary.main}}
                            disabled = {mensaje.mostrar}
                            onClick = {handleCancelar}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            sx = {{color : tema.palette.secondary.main}}
                            onClick = {handleAceptar}
                            disabled = {mensaje.mostrar || nuevaUnidad.nombre === '' ? true : false}
                        >
                            Aceptar
                        </Button>
                    </Grid>
                </Grid>                
            </Paper>
            
        </Container>
    )
}

//No se puede crear una unidad sin estar logueado
export const getServerSideProps = async (contexto) => {
    return await controlarSiSeEstaLogueado(contexto.req);
}

export default NuevaUnidad;