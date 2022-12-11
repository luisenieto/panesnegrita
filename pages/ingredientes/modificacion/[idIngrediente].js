import { useState, useContext, useEffect } from 'react';
import { obtenerIngredienteParaModificar } from "../../api/ingredientes/bdAuxiliares";
import { ObjectId } from 'mongodb';
import { ProveedorContexto } from "../../../contexto/proveedor";
import { constantes } from "../../../auxiliares/auxiliaresIngredientes";
import { Container, Paper, Grid } from '@mui/material';
import EtiquetaTitulo from "../../../componentes/comunes/etiquetaTitulo";
import EtiquetaEstado from "../../../componentes/comunes/etiquetaEstado";
import CampoNombre from "../../../componentes/ingredientes/campoNombre";
import MensajeInformativo from "../../../componentes/comunes/mensajeInformativo";
import CampoStock from "../../../componentes/ingredientes/campoStock";
import CampoStockMinimo from "../../../componentes/ingredientes/campoStockMinimo";
import AutoCompletarUnidad from "../../../componentes/ingredientes/autoCompletarUnidad";
import Botones from "../../../componentes/ingredientes/botones";

//Componente que permite modificar un ingrediente
const ModificacionIngrediente = (props) => { 
    const { setIngredientes } = useContext(ProveedorContexto);

    const [ingredienteAModificar, setIngredienteAModificar] = useState(props.ingrediente);    
    //ingredienteAModificar es el ingrediente que se está modificando       
    //ingredienteAModificar._id es String

    const ingredientes = props.ingredientes;
    //los _id son String

    useEffect(() => {
        if (ingredientes)
            setIngredientes(ingredientes);
    }, []); //eslint-disable-line react-hooks/exhaustive-deps 
    //el comentario anterior es para que en la consola no aparezca el warning diciendo que el array de depdencias de useEffect está vacío

    const [mensaje, setMensaje] = useState(
        props.mensaje === constantes.INGREDIENTES_LEIDOS_CORRECTAMENTE ?
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

    return (
        <Container component = "main"  sx = {{ mb: 4 }}>
            <Paper variant = "outlined" sx = {{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <EtiquetaTitulo leyenda = {constantes.INGREDIENTES} />
                <EtiquetaEstado leyenda = {constantes.MODIFICACION_INGREDIENTE} />
                <Grid container spacing = {2}>
                    <CampoNombre 
                        leyenda = {constantes.NOMBRE}
                        ingrediente = {ingredienteAModificar} 
                        setIngrediente = {setIngredienteAModificar} 
                        mostrar = {mensaje.mostrar}
                    />
                    <MensajeInformativo 
                        mensaje = {mensaje}
                        setMensaje = {setMensaje}
                        ruta = '/ingredientes'
                    />
                    <CampoStock
                        leyenda = {constantes.STOCK}
                        ingrediente = {ingredienteAModificar} 
                        setIngrediente = {setIngredienteAModificar}
                        mostrar = {mensaje.mostrar}
                    />
                    <AutoCompletarUnidad 
                        leyenda = {constantes.UNIDAD}
                        ingrediente = {ingredienteAModificar} 
                        setIngrediente = {setIngredienteAModificar}
                    />
                    <CampoStockMinimo 
                        leyenda = {constantes.STOCK_MINIMO}
                        ingrediente = {ingredienteAModificar} 
                        setIngrediente = {setIngredienteAModificar}
                        mostrar = {mensaje.mostrar}
                    />
                    <Botones 
                        mostrar = {mensaje.mostrar}
                        ingrediente = {ingredienteAModificar}
                        setMensaje = {setMensaje}
                        operacion = 'M'
                    />
                </Grid>                
            </Paper>
        </Container>
    )
}

export const getServerSideProps = async (contexto) => {     
    const { params } = contexto;
    const _id = new ObjectId(params.idIngrediente);
    //params.idIngrediente es String
    const resultadoObtenerIngrediente = await obtenerIngredienteParaModificar(_id);        
    return {
        props : {    
            mensaje : resultadoObtenerIngrediente.mensaje,
            ingrediente : JSON.parse(JSON.stringify(resultadoObtenerIngrediente.ingrediente)),               
            ingredientes: JSON.parse(JSON.stringify(resultadoObtenerIngrediente.ingredientes)),            
        }
    }    
}

export default ModificacionIngrediente;
