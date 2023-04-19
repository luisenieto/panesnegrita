import { useRouter } from "next/router";
import { Container, Paper, Grid, Button } from '@mui/material';
import EtiquetaTitulo from "../../../componentes/comunes/etiquetaTitulo";
import EtiquetaEstado from "../../../componentes/comunes/etiquetaEstado";
import CampoUnidad from "../../../componentes/unidades/campoUnidad";
import Equivalencias from "../../../componentes/unidades/equivalencias";
import { useState, useContext, useEffect } from 'react';
import { ProveedorContexto } from "../../../contexto/proveedor";
import { useTheme } from "@emotion/react";
import { constantes } from "../../../auxiliares/auxiliaresUnidades";
//import MensajeInformativo from '../../../componentes/unidades/mensajeInformativo';
import MensajeInformativo from '../../../componentes/comunes/mensajeInformativo';
import { obtenerUnidadParaModificar } from "../../api/unidades/bdAuxiliares";
import axios from 'axios';
import { ObjectId } from 'mongodb';

//Componente que permite modificar una unidad
const ModificacionUnidad = (props) => {        
    const router = useRouter();   
    const { setUnidades } = useContext(ProveedorContexto); 

    const tema = useTheme();
      
    const [unidadAModificar, setUnidadAModificar] = useState(props.unidad);    
    //unidadAModificar es la unidad que se está modificando       
    //unidadAModificar._id es String
    const unidades = props.unidades;
    //los _id son String

    useEffect(() => {
        if (unidades)
            setUnidades(unidades);
    }, []); //eslint-disable-line react-hooks/exhaustive-deps 
    //el comentario anterior es para que en la consola no aparezca el warning diciendo que el array de depdencias de useEffect está vacío
    
    const [mensaje, setMensaje] = useState(
        props.mensaje === constantes.UNIDADES_LEIDAS_CORRECTAMENTE ?
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

    //se ejecuta cuando se selecciona Cancelar
    const handleCancelar = () => {
        router.push('/unidades');
    }

    //se ejecuta cuando se selecciona Aceptar
    const handleAceptar = async () => {
        const ruta = '/api/unidades/';
        try {                
            const respuesta = await axios.post(ruta, {...unidadAModificar, operacion : 'M' });
            const data = await respuesta.data;
            if (data.mensaje === constantes.UNIDAD_MODIFICADA) {
                setMensaje({
                    gravedad : 'success',
                    titulo : constantes.MODIFICACION_UNIDAD,
                    texto : data.mensaje,
                    mostrar : true
                });
            }
            else {
                setMensaje({
                    gravedad : 'error',
                    titulo : constantes.MODIFICACION_UNIDAD,
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

    // mb: margin-bottom
    // my: margin-top, margin-bottom
    // p: padding
    // py: padding-top, padding-bottom
    // px: padding-left, padding-right
    return (
        <Container component = "main" maxWidth = "sm" sx = {{ mb: 4 }}>
            <Paper variant = "outlined" sx = {{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                {
                    unidadAModificar ?
                        <>
                            <EtiquetaTitulo leyenda = {constantes.UNIDADES} />
                            <EtiquetaEstado leyenda = {constantes.MODIFICACION_UNIDAD} />
                            <Grid container spacing = {3}>
                                <CampoUnidad 
                                    leyenda = {constantes.MODIFICACION_UNIDAD} 
                                    unidad = {unidadAModificar} 
                                    setUnidad = {setUnidadAModificar}
                                    mostrar = {mensaje.mostrar} 
                                />    
                                <MensajeInformativo 
                                    mensaje = {mensaje}
                                    setMensaje = {setMensaje}
                                    ruta = '/unidades'
                                />                            
                                <Equivalencias 
                                    leyenda = {constantes.EQUIVALENCIAS} 
                                    unidad = {unidadAModificar}
                                    setUnidad = {setUnidadAModificar}
                                    mostrar = {mensaje.mostrar}
                                />
                                <Grid container direction = 'row-reverse' sx = {{marginTop : 2}}>
                                    <Button 
                                        sx = {{color : tema.palette.secondary.main}}
                                        onClick = {handleCancelar}
                                    >
                                        {constantes.CANCELAR}
                                    </Button>
                                    <Button 
                                        sx = {{color : tema.palette.secondary.main}}
                                        onClick = {handleAceptar}
                                        disabled = {unidadAModificar.nombre === '' ? true : false}
                                    >
                                        {constantes.ACEPTAR}
                                    </Button>
                                </Grid>
                            </Grid>
                        </>
                    :
                        <MensajeInformativo 
                            mensaje = {mensaje}
                            setMensaje = {setMensaje}
                        />
                }                
            </Paper>
        </Container>
    )    
}

export const getServerSideProps = async (contexto) => {     
    const { params } = contexto;
    const _id = new ObjectId(params.idUnidad);
    //params.idUnidad es String
    const resultadoObtenerUnidad = await obtenerUnidadParaModificar(_id);        
    return {
        props : {    
            mensaje : resultadoObtenerUnidad.mensaje,
            unidad : JSON.parse(JSON.stringify(resultadoObtenerUnidad.unidad)),               
            unidades: JSON.parse(JSON.stringify(resultadoObtenerUnidad.unidades)),            
        }
    }    
}


export default ModificacionUnidad;