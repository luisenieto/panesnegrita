import { Container, Stack } from '@mui/material';
import { useTheme } from '@emotion/react';
import { constantes } from '../../auxiliares/auxiliaresPedidos';
import Estado from './estado';

//Componente que muestra los estados y cantidades de pedidos de un producto
const PedidosEnColores = ({ pedidos }) => {    
    const tema = useTheme();
    
    let cantEstadoPedido = 0;
    let colorEstadoPedido = tema.palette.error.main; //rojo
    let cantEstadoElaboracion = 0;
    let colorEstadoElaboracion = tema.palette.warning.main; //amarillo
    let cantEstadoTerminado = 0;
    let colorEstadoTerminado = tema.palette.success.main; //verde

    for(let i in pedidos) {
        switch(pedidos[i].estado) {
            case constantes.ESTADO_PEDIDO :                
                cantEstadoPedido++;
                break;
            case constantes.ESTADO_ELABORACION :
                cantEstadoElaboracion++;
                break;
            default : //terminado
                cantEstadoTerminado++;
                break;
        }
    }    
    
    return (  
        <Container>
            <Stack direction = "row"  alignItems = "center" justifyContent = "space-between" >
                <Estado 
                    color = {colorEstadoPedido}
                    cantidad = {cantEstadoPedido}
                />
                <Estado 
                    color = {colorEstadoElaboracion}
                    cantidad = {cantEstadoElaboracion}
                />
                <Estado 
                    color = {colorEstadoTerminado}
                    cantidad = {cantEstadoTerminado}
                />
            </Stack>         
        </Container>              
    )
}

export default PedidosEnColores;