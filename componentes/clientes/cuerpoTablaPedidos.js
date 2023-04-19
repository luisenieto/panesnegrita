import { TableBody, TableRow, TableCell } from '@mui/material';
import FilaPedidos from './filaPedidos';

const CuerpoTablaPedidos = ({ordenarPor, orden, pagina, filasPorPagina, cliente, setCliente, setearOpenPopup}) => {
    const pedidos = cliente.pedidos;

    // Para evitar que la última página haga un salto cuando haya filas vacías
    const filasVacias = pagina > 0 
    ? 
        Math.max(0, (1 + pagina) * filasPorPagina - pedidos.length) 
    : 
        0;

    const comparador = (producto1, producto2) => {
        if (orden === 'asc')
            return producto1[ordenarPor].localeCompare(producto2[ordenarPor], undefined, { sensitivity: 'base' })
        else
            return - producto1[ordenarPor].localeCompare(producto2[ordenarPor], undefined, { sensitivity: 'base' })
    }

    return (
        <TableBody>
            {
                pedidos.slice().sort(comparador).map((pedido, i) => (
                    <FilaPedidos 
                        unPedido = {pedido}
                        key = {i}
                        cliente = {cliente}
                        setCliente = {setCliente}
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

export default CuerpoTablaPedidos;