import { TableBody, TableRow, TableCell } from '@mui/material';
import Fila from './fila';


const CuerpoTabla = ({ordenarPor, orden, pagina, filasPorPagina, ingredientes, setearOpenPopup}) => {        

    // Para evitar que la última página haga un salto cuando haya filas vacías
    const filasVacias = pagina > 0 
        ? 
            Math.max(0, (1 + pagina) * filasPorPagina - unidades.length) 
        : 
            0;

    const comparador = (ingrediente1, ingrediente2) => {
        if (orden === 'asc')
            return ingrediente1[ordenarPor].localeCompare(ingrediente2[ordenarPor], undefined, { sensitivity: 'base' })
        else
            return - ingrediente1[ordenarPor].localeCompare(ingrediente2[ordenarPor], undefined, { sensitivity: 'base' })
    }  

    return (
        <TableBody>
            {
                ingredientes.slice().sort(comparador).map((ingrediente, i) => (
                    <Fila 
                        unIngrediente = {ingrediente}
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