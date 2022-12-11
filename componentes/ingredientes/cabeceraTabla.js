import { TableHead, TableRow, TableCell, TableSortLabel, Box } from '@mui/material';
import { visuallyHidden } from '@mui/utils'; 
import { useTheme } from '@mui/material';
import { constantes } from '../../auxiliares/auxiliaresIngredientes';

const CabeceraTabla = ({orden, configurarOrdenamiento}) => {
    const tema = useTheme();

    return (
        <TableHead>
            <TableRow>                                
                <TableCell sx = {{
                        width : 5, 
                        backgroundColor : tema.palette.primary.main,
                    }} 
                />
                <TableCell sx = {{
                        width : 5, 
                        backgroundColor : tema.palette.primary.main,
                    }} 
                />
                <TableCell 
                    sortDirection = {orden} 
                    sx = {{
                        maxWidth : 60,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}
                >
                    <TableSortLabel 
                        sx = {{
                            '&.MuiTableSortLabel-root': {
                                color: tema.palette.primary.contrastText,
                            },
                            '&.MuiTableSortLabel-root:hover': {
                                color: tema.palette.primary.contrastText,
                            },
                            '&.Mui-active': {
                                color: tema.palette.primary.contrastText,
                            },
                            '& .MuiTableSortLabel-icon': {
                                color: tema.palette.primary.contrastText,
                            },
                        }}
                        active = {true} 
                        direction = {orden} 
                        onClick = {configurarOrdenamiento}
                    >
                        {constantes.NOMBRE}
                        <Box 
                            component = "span" 
                            sx = {visuallyHidden}
                        >
                            {
                                orden === 'desc' ? 
                                    'ordenado descendentemente' 
                                : 
                                    'ordenado ascendentemente'
                            }
                        </Box>                            
                    </TableSortLabel>
                </TableCell>
                <TableCell sx = {{
                        maxWidth : 30,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}
                    align = 'center'
                >
                    {constantes.STOCK}
                </TableCell>                
                <TableCell sx = {{
                        maxWidth : 30,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}
                    align = 'center'
                >
                    {constantes.STOCK_MINIMO}
                </TableCell>
                <TableCell sx = {{
                        maxWidth : 60,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}
                >
                    {constantes.UNIDAD}
                </TableCell>
                <TableCell sx = {{
                        maxWidth : 30,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}
                >
                    {constantes.ESTADO}
                </TableCell>
            </TableRow>
        </TableHead>
    )
}

export default CabeceraTabla;