import { TableBody, TableRow, TableCell } from '@mui/material';
import Fila from './fila';

const CuerpoTabla = ({ordenarPor, orden, pagina, filasPorPagina, producto, setProducto, setearOpenPopup}) => {

    const pedidos = producto.pedidos;

    // Para evitar que la última página haga un salto cuando haya filas vacías
    const filasVacias = pagina > 0 
    ? 
        Math.max(0, (1 + pagina) * filasPorPagina - pedidos.length) 
    : 
        0;

    const comparador = (cliente1, cliente2) => {
        if (orden === 'asc')
            return cliente1[ordenarPor].localeCompare(cliente2[ordenarPor], undefined, { sensitivity: 'base' })
        else
            return - cliente1[ordenarPor].localeCompare(cliente2[ordenarPor], undefined, { sensitivity: 'base' })
    } 

    return (
        <TableBody>
            {
                pedidos.slice().sort(comparador).map((pedido, i) => (
                    <Fila 
                        unPedido = {pedido}
                        key = {i}
                        producto = {producto}
                        setProducto = {setProducto}
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
                        <TableCell colSpan = {5} />
                    </TableRow>
                )
            }
        </TableBody>
    )
}

export default CuerpoTabla;