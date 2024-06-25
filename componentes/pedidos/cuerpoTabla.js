import { TableBody, TableRow, TableCell } from '@mui/material';
import Fila from './fila';

//Componente que muestra el cuerpo de la tabla de pedidos
const CuerpoTabla = ({ordenarPor, orden, pagina, filasPorPagina, pedidos, setearOpenPopup}) => {        

    // Para evitar que la última página haga un salto cuando haya filas vacías
    const filasVacias = pagina > 0 
        ? 
            Math.max(0, (1 + pagina) * filasPorPagina - pedidos.length) 
        : 
            0;

    const comparador = (pedido1, pedido2) => {
        if (orden === 'asc')
            return pedido1[ordenarPor].localeCompare(pedido2[ordenarPor], undefined, { sensitivity: 'base' })
        else
            return - pedido1[ordenarPor].localeCompare(pedido2[ordenarPor], undefined, { sensitivity: 'base' })
    }  

    return (
        <TableBody>
            {
                pedidos.slice().sort(comparador).map((pedido, i) => (
                    <Fila 
                        unPedido = {pedido}
                        key = {i}
                        setearOpenPopup = {setearOpenPopup}
                    />
                ))                
            }
            {
                filasVacias > 0 && (
                    <TableRow
                        style = {{
                            height: 53 * filasVacias
                        }}
                    >
                        <TableCell colSpan = {4} />
                    </TableRow>
                )
            }
        </TableBody>
    )
}

export default CuerpoTabla;