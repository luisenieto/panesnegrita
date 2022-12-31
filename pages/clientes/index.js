import { obtenerClientes } from "../api/clientes/bdAuxiliares";
import { Container, Stack, Grid, Typography } from "@mui/material";
import { constantes } from "../../auxiliares/auxiliaresClientes";
import Cliente from "../../componentes/clientes/cliente";

const Clientes = (props) => {    
    const clientes = props.clientes;
    //los _id se guardan como cadena

    return (
        <Container>
            <Typography variant = "h4" sx = {{ mb: 3, mt: 5 }}>
                {constantes.CLIENTES}
            </Typography>

            <Stack direction = "row" flexWrap = "wrap-reverse" alignItems = "center" justifyContent = "flex-end" sx = {{ mb: 5 }}>
                <Stack direction = "row" spacing = {1} flexShrink = {0} sx = {{ my: 1 }}>
                    {/* <ProductFilterSidebar
                        openFilter={openFilter}
                        onOpenFilter={handleOpenFilter}
                        onCloseFilter={handleCloseFilter}
                    /> */}
                    {/* <ProductSort /> */}
                </Stack>
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