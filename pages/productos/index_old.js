import { useState } from "react";
import { obtenerClientes } from "../api/clientes/bdAuxiliares";
import { Container, Stack, Grid, Typography } from "@mui/material";
import { constantes } from "../../auxiliares/auxiliaresClientes";
import Cliente from "../../componentes/clientes/cliente";
import Filtro from "../../componentes/clientes/filtro";
import Ordenamiento from "../../componentes/clientes/ordenamiento";

//Componente que muestra todos los clientes
const Clientes = (props) => {    
    const clientes = props.clientes;
    //los _id se guardan como cadena

    const [mostrarFiltro, setMostrarFiltro] = useState(false);
    //controla que se muestre o no el filtro

    const OPCIONES_FILTRADO = [constantes.FILTRO_TODOS, constantes.FILTRO_CON_PEDIDOS, constantes.FILTRO_SIN_PEDIDOS];
    //vector con las opciones para el filtrado de clientes

    const [filtroElegido, setFiltroElegido] = useState(OPCIONES_FILTRADO[0]);
    //controla la opción de filtro elegida

    const [OPCIONES_ORDENAMIENTO, setOPCIONES_ORDENAMIENTO] = useState(
        filtroElegido === constantes.FILTRO_TODOS || constantes.FILTRO_CON_PEDIDOS ? 
            [constantes.ORDENAR_POR_APELLIDO_ASC, constantes.ORDENAR_POR_APELLIDO_DESC, constantes.ORDENAR_POR_PEDIDOS_ASC, constantes.ORDENAR_POR_PEDIDOS_DESC] 
        : 
            [constantes.ORDENAR_POR_APELLIDO_ASC, constantes.ORDENAR_POR_APELLIDO_DESC]);
    //const OPCIONES_ORDENAMIENTO = [constantes.ORDENAR_POR_APELLIDO_ASC, constantes.ORDENAR_POR_APELLIDO_DESC, constantes.ORDENAR_POR_PEDIDOS_ASC, constantes.ORDENAR_POR_PEDIDOS_DESC];
    //vector con las opciones para el ordenamiento de clientes

    const [ordenamientoElegido, setOrdenamientoElegido] = useState(OPCIONES_ORDENAMIENTO[0]);
    //controla la opción de ordenamiento elegida

    return (
        <Container>
            <Typography variant = "h4" sx = {{ mb: 3, mt: 5 }}>
                {constantes.CLIENTES}
            </Typography>

            <Stack direction = "row" flexWrap = "wrap-reverse" alignItems = "center" justifyContent = "flex-end" sx = {{ mb: 5 }}>
                {/* <Stack direction = "row" spacing = {1} flexShrink = {0} sx = {{ my: 1 }}> */}
                    <Filtro 
                        mostrarFiltro = {mostrarFiltro}
                        setMostrarFiltro = {setMostrarFiltro}
                        opciones_filtrado = {OPCIONES_FILTRADO}
                        filtroElegido = {filtroElegido}
                        setFiltroElegido = {setFiltroElegido}
                        setOPCIONES_ORDENAMIENTO = {setOPCIONES_ORDENAMIENTO}
                    />                    
                    <Ordenamiento 
                        opciones_ordenamiento = {OPCIONES_ORDENAMIENTO}
                        ordenamientoElegido = {ordenamientoElegido}
                        setOrdenamientoElegido = {setOrdenamientoElegido}
                    />
                {/* </Stack> */}
            </Stack>

            <Grid container spacing = {3}>
                {
                    clientes.map(cliente => {
                        return (
                            <Grid key = {cliente._id} item xs = {6} sm = {6} md = {3}>
                                <Cliente cliente = {cliente} />
                            </Grid>
                        )
                    })
                }
            </Grid>
        </Container>
    )
}

export const getServerSideProps = async () => {
    const resultadoObtenerClientes = await obtenerClientes();
    return {
        props : {                
            clientes: JSON.parse(JSON.stringify(resultadoObtenerClientes.clientes)),
            mensaje : resultadoObtenerClientes.mensaje                
        }
    }    
    //getServerSideProps() tiene un problema al serializar el tipo de datos ObjectId de Mongo
    //Hay un hilo en GitHub al respecto (https://github.com/vercel/next.js/issues/11993)
    //Para solucionar esto se puede usar stringify() y luego parse()
    //Esta información la saqué de https://www.mongodb.com/developer/languages/javascript/nextjs-with-mongodb/
    //Lo que hay que tener en cuenta es que al usar stringify() se convierte a cadena el tipo ObjectId
    //En memoria, los _id van a estar como cadenas (hay que tener en cuenta esto para las comparaciones por ejemplo)
    //Luego, para operaciones que interactúen con la BD hay que transformarlo a ObjectId
}

export default Clientes;