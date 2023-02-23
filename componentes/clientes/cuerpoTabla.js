import { TableBody, TableRow, TableCell } from '@mui/material';
import Fila from './fila';

const CuerpoTabla = ({ordenarPor, orden, pagina, filasPorPagina, clientes, setearOpenPopup}) => {
    // Para evitar que la última página haga un salto cuando haya filas vacías
    const filasVacias = pagina > 0 
    ? 
        Math.max(0, (1 + pagina) * filasPorPagina - clientes.length) 
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
                clientes.slice().sort(comparador).map((cliente, i) => (
                    <Fila 
                        unCliente = {cliente}
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
                        <TableCell colSpan = {9} />
                    </TableRow>
                )
            }
        </TableBody>
    )
}

export default CuerpoTabla;