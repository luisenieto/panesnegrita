import { Box, Card, CardHeader, CardMedia, CardActions, Button, IconButton, Menu, MenuItem, Link, Typography, Stack, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import PedidosEnColores from './pedidosEnColores';
import { useState, useContext } from 'react';
import { constantes } from '../../auxiliares/auxiliaresProductos';
import { FiMoreVertical } from 'react-icons/fi';
import { RiEditLine } from 'react-icons/ri';
import { GoTrashcan } from 'react-icons/go';
import { BsCart2 } from 'react-icons/bs';
import { useRouter } from 'next/router';
import { ProveedorContexto } from '../../contexto/proveedor';
import { moneda } from '../../auxiliares/auxiliaresProductos';

const FotoProductoConEstilo = styled('img')({
    top: 0,
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    position: 'absolute',
});

//Componente que muestra la información de un producto
const Producto = ({ producto }) => {
    const router = useRouter();
    const { clientes, setClientes, setRedirigirA } = useContext(ProveedorContexto);

    const { _id, foto, nombre, precio, pedidos } = producto;

    const [anchorEl, setAnchorEl] = useState(null);
    //controla la visibilidad del menú    

    const handleClic = (evento) => {
        setAnchorEl(evento.currentTarget);
    }

    const handleEditar = (evento, _id) => {
        setAnchorEl(null);
        setRedirigirA(`/productos/modificacion/${_id}`);
        router.push(`/productos/modificacion/${_id}`);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


    //formatea una cadena para que tenga un largo máximo de 100 caracteres
    //sirve para mostrar el texto del pedido con los puntitos
    const formatearCadena = (cadena) => {
        // if (cadena.length > 12)
        //     return cadena.substring(0, 8) + "..."
        if (cadena.length < 100)
            return cadena + ' ' + '.'.repeat(100 - cadena.length)
        else
            return cadena;
    }    

    return (
        <Card>
            <CardHeader                
                action = {
                    <IconButton aria-label="settings" onClick = {handleClic}>
                        <FiMoreVertical />
                    </IconButton>
                }
                title = {nombre}                
                titleTypographyProps = {{
                    align : "left",
                    variant : "subtitle1",
                    noWrap : true
                }}
                subheader = {moneda(precio)}
                subheaderTypographyProps = {{
                    fontWeight: 'bold',
                    variant : "subtitle1",
                }}
            >                
            </CardHeader>
            <CardMedia>
                <Box sx = {{ pt: '100%', position: 'relative' }}>            
                    <FotoProductoConEstilo alt = {nombre} src = {foto ? foto : constantes.FOTO_PREDETERMINADA} />            
                </Box>
            </CardMedia>            
            <Menu
                id="menu-earning-card"
                anchorEl = {anchorEl}
                keepMounted
                open = {Boolean(anchorEl)}
                onClose = { handleClose }
                variant = "selectedMenu"
                anchorOrigin = {{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                transformOrigin = {{
                    vertical: 'top',
                    horizontal: 'right'
                }}
            >
                <MenuItem onClick = {evento => handleEditar(evento, _id)} >
                    <RiEditLine />&nbsp;{constantes.MENU_EDITAR}
                </MenuItem>
                <MenuItem /*onClick = {handleClose}*/>
                    <GoTrashcan />&nbsp;{constantes.MENU_BORRAR}
                </MenuItem>
                <MenuItem /*onClick = {handleClose}*/>
                    <BsCart2 />&nbsp;{constantes.MENU_VER_PEDIDOS}
                </MenuItem>
            </Menu>
            <CardActions disableSpacing >   
                <PedidosEnColores 
                    pedidos = {pedidos}
                />         
            </CardActions>

            <CardActions disableSpacing >                         
                    <Button 
                        variant = 'contained' 
                        fullWidth
                        sx = {{
                            marginLeft : '0px',
                            marginRight : '0px',
                            marginTop : '0px',
                            padding : '10px 5px',
                        }}
                        onClick = { () => {                          
                            setRedirigirA(`/productos/pedidos/nuevo/${_id}`);                      
                            router.push(`/productos/pedidos/nuevo/${_id}`);
                        }}
                    >
                        {constantes.PEDIDO}
                    </Button>
            </CardActions>
        </Card>
    )
}

export default Producto;