import { TableHead, TableRow, TableCell, TableSortLabel, Box } from '@mui/material';
import { visuallyHidden } from '@mui/utils'; 
import { useTheme } from '@mui/material';
import { constantes } from '../../auxiliares/auxiliaresPedidos'; 

//Componente que muestra la cabecera de la tabla de pedidos
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
                        maxWidth : 30,
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
                        {constantes.FECHA}
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
                        maxWidth : 60,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}
                    align = 'left'
                >
                    {constantes.CLIENTE}
                </TableCell>                
                <TableCell sx = {{
                        maxWidth : 60,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}
                    align = 'left'
                >
                    {constantes.PRODUCTO}
                </TableCell>
                <TableCell sx = {{
                        maxWidth : 20,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}
                    align = 'center'
                >
                    {constantes.CANTIDAD}
                </TableCell>
                <TableCell sx = {{
                        maxWidth : 30,
                        backgroundColor : tema.palette.primary.main,
                        color : tema.palette.primary.contrastText
                    }}
                    align = 'center'
                >
                    {constantes.IMPORTE}
                </TableCell>
            </TableRow>
        </TableHead>
    )
}

export default CabeceraTabla;