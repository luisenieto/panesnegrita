import { TablePagination } from '@mui/material';
import { constantes } from '../../auxiliares/auxiliaresUnidades';
//import { useContext } from 'react';
//import { ProveedorContexto } from '../../contexto/proveedor';

const PaginacionTabla = ({filasPorPagina, setearFilasPorPagina, pagina, setearPagina, cantUnidades}) => {

    const handleChangePage = (evento, nuevaPagina) => setearPagina(nuevaPagina);

    const handleChangeRowsPerPage = (evento) => {
        setearFilasPorPagina(parseInt(evento.target.value, 10));
        setearPagina(0);
    }

    return (
        <TablePagination 
            rowsPerPageOptions = {[5, 10, 25]}
            component = "div"
            count = {cantUnidades}
            rowsPerPage = {filasPorPagina}
            page = {pagina}
            labelRowsPerPage = {constantes.UNIDADES_POR_PAGINA}
            labelDisplayedRows = {function defaultLabelDisplayedRows({ from, to, count }) { 
                return `${from} - ${to} de ${count !== -1 ? count : `more than ${to}`}`; 
            }}
            showFirstButton = {true}
            showLastButton = {true}
            onPageChange = {handleChangePage}
            onRowsPerPageChange = {handleChangeRowsPerPage}
        />
    )
}

export default PaginacionTabla;