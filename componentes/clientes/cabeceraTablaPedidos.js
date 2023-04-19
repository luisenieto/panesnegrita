import { TableHead, TableRow, TableCell, TableSortLabel, Box } from '@mui/material';
import { visuallyHidden } from '@mui/utils'; 
import { useTheme } from '@mui/material';
import { constantes } from '../../auxiliares/auxiliaresPedidos';

const CabeceraTablaPedidos = ({ orden, configurarOrdenamiento }) => {
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
                    align = 'left'
                    sortDirection = {orden} 
                    sx = {{
                        maxWidth : 50,
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
                        {constantes.PRODUCTO}
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
                <TableCell 
                    align = 'center' 
                    sx = {{
                        maxWidth : 20,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}                   
                >
                    {constantes.CANTIDAD}
                </TableCell>  
                <TableCell 
                    align = 'center' 
                    sx = {{
                        maxWidth : 30,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}                    
                >
                    {constantes.IMPORTE}
                </TableCell>
                <TableCell 
                    align = 'center'
                    sx = {{
                        maxWidth : 30,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}
                >
                    {constantes.FECHA}
                </TableCell>
                <TableCell align = 'center' sx = {{
                        maxWidth : 30,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}
                >
                    {constantes.ESTADO}
                </TableCell>
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
            </TableRow>
        </TableHead>
    )
}

export default CabeceraTablaPedidos;