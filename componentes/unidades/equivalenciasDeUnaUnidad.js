import { TableContainer, Table, TableBody, TableRow, TableCell, Collapse, Typography, Box } from '@mui/material';
import { obtenerNombreUnidad } from '../../auxiliares/auxiliaresUnidades';
import { useContext } from 'react';
import { ProveedorContexto } from '../../contexto/proveedor';

//componente que muestra las equivalencias de una unidad (en la lista de todas las unidades)
const EquivalenciasDeUnaUnidad = ({abierto, equivalencias}) => {
    const {unidades} = useContext(ProveedorContexto);

    return (
        <TableCell style = {{ paddingBottom: 0, paddingTop: 0 }} colSpan = {4}>
            <Collapse in = {abierto} timeout = "auto" unmountOnExit>
                <Box sx={{ margin: 1 }}>
                    <TableContainer>
                        <Table stickyHeader aria-labelledby = 'tituloTabla1' size = 'medium'>
                            <TableBody >
                                {
                                    equivalencias.map((equivalencia, i) => (
                                        <TableRow hover key = {i}>
                                                                              
                                            <TableCell style = {{ paddingBottom : 0, paddingTop : 0 }} >
                                                <Collapse in = {abierto} timeout = 'auto' unmountOnExit >
                                                    <Box  >
                                                        <Typography sx = {{paddingLeft : 20}} variant = 'body1' gutterBottom component = 'div'>
                                                            {equivalencia.proporcion} {obtenerNombreUnidad(equivalencia.idUnidad, unidades)}
                                                        </Typography>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Collapse>
        </TableCell>
    )
}

export default EquivalenciasDeUnaUnidad;