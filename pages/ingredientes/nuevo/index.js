import { useState } from 'react';
import { Container, Paper, Grid } from '@mui/material';
import EtiquetaTitulo from '../../../componentes/comunes/etiquetaTitulo';
import EtiquetaEstado from '../../../componentes/comunes/etiquetaEstado';
import CampoNombre from '../../../componentes/ingredientes/campoNombre';
import CampoStock from '../../../componentes/ingredientes/campoStock';
import AutoCompletarUnidad from '../../../componentes/ingredientes/autoCompletarUnidad';
import CampoStockMinimo from '../../../componentes/ingredientes/campoStockMinimo';
import Botones from '../../../componentes/ingredientes/botones';
import MensajeInformativo from '../../../componentes/comunes/mensajeInformativo';
//import Foto from '../../../componentes/ingredientes/foto';
import { constantes } from '../../../auxiliares/auxiliaresIngredientes';
import { controlarSiSeEstaLogueado } from '../../../lib/auth';

//Componente que permite crear un nuevo ingrediente
const NuevoIngrediente = (props) => { 

    const [nuevoIngrediente, setNuevoIngrediente ] = useState({
        //el _id lo genera MongoDB
        nombre : '',
        stock : 0, 
        stockMinimo : 0,
        idUnidad : null     
    });
    //nuevoIngrediente es el ingrediente que se está creando    

    const [mensaje, setMensaje] = useState({
        gravedad : 'error',
        titulo : '',
        texto : '',
        mostrar : false
    });
    //controla el componente MensajeInformativo

    return (
        <Container component = "main"  sx = {{ mb: 4 }}>
            <Paper variant = "outlined" sx = {{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <EtiquetaTitulo leyenda = {constantes.INGREDIENTES} />
                <EtiquetaEstado leyenda = {constantes.NUEVO_INGREDIENTE} />
                <Grid container spacing = {2}>                    
                    <CampoNombre 
                        leyenda = {constantes.NOMBRE}
                        ingrediente = {nuevoIngrediente} 
                        setIngrediente = {setNuevoIngrediente} 
                        mostrar = {mensaje.mostrar}
                    />
                    <MensajeInformativo 
                        mensaje = {mensaje}
                        setMensaje = {setMensaje}
                        ruta = '/ingredientes'
                    />
                    <CampoStock
                        leyenda = {constantes.STOCK}
                        ingrediente = {nuevoIngrediente} 
                        setIngrediente = {setNuevoIngrediente}
                        mostrar = {mensaje.mostrar}
                    />
                    <AutoCompletarUnidad 
                        leyenda = {constantes.UNIDAD}
                        ingrediente = {nuevoIngrediente} 
                        setIngrediente = {setNuevoIngrediente}
                    />
                    <CampoStockMinimo 
                        leyenda = {constantes.STOCK_MINIMO}
                        ingrediente = {nuevoIngrediente} 
                        setIngrediente = {setNuevoIngrediente}
                        mostrar = {mensaje.mostrar}
                    />
                    <Botones 
                        mostrar = {mensaje.mostrar}
                        ingrediente = {nuevoIngrediente}
                        setMensaje = {setMensaje}
                        operacion = 'A'
                    />
                </Grid>
            </Paper>
        </Container>
    )
}

//No se puede crear un ingrediente sin estar logueado
export const getServerSideProps = async (contexto) => {
    return await controlarSiSeEstaLogueado(contexto.req);
}

export default NuevoIngrediente;