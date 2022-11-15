import { TableBody, TableRow, TableCell } from '@mui/material';
import Fila from './fila';

const CuerpoTabla = ({ordenarPor, orden, pagina, filasPorPagina, unidades, setearOpenPopup}) => {

    // Para evitar que la última página haga un salto cuando haya filas vacías
    const filasVacias = pagina > 0 
        ? 
            Math.max(0, (1 + pagina) * filasPorPagina - unidades.length) 
        : 
            0;

    const comparador = (unidad1, unidad2) => {
        if (orden === 'asc')
            return unidad1[ordenarPor].localeCompare(unidad2[ordenarPor], undefined, { sensitivity: 'base' })
        else
            return - unidad1[ordenarPor].localeCompare(unidad2[ordenarPor], undefined, { sensitivity: 'base' })
    }  

    return (
        <TableBody>
            {
                unidades.slice().sort(comparador).map((unidad, i) => (
                    <Fila 
                        unaUnidad = {unidad}
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