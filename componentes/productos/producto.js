import { Box, Card, CardHeader, CardMedia, CardActions, Button, IconButton, Menu, MenuItem, Link, Typography, Stack, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import PedidosEnColores from '../pedidos/pedidosEnColores';
import { useState, useContext } from 'react';
import { constantes } from '../../auxiliares/auxiliaresProductos';
import { FiMoreVertical } from 'react-icons/fi';
import { RiEditLine } from 'react-icons/ri';
import { GoTrashcan } from 'react-icons/go';
import { BsCart2 } from 'react-icons/bs';
import { useRouter } from 'next/router';
import { ProveedorContexto } from '../../contexto/proveedor';
import { moneda } from '../../auxiliares/auxiliares';

const FotoProductoConEstilo = styled('img')({
    top: 0,
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    position: 'absolute',
});

//Componente que muestra la información de un producto
const Producto = ({ unProducto, setearOpenPopup }) => {
    const router = useRouter();
    const { setProductoABorrar, setRedirigirA } = useContext(ProveedorContexto);

    const { _id, foto, nombre, precio, pedidos } = unProducto;

    const [anchorEl, setAnchorEl] = useState(null);
    //controla la visibilidad del menú    

    //Se ejecuta al seleccionar el botón de los 3 puntos verticales
    const handleClic = (evento) => {
        setAnchorEl(evento.currentTarget);
    }

    //Se ejecuta al elegir el menú para modificar el producto
    const handleEditar = (_id) => {
        setAnchorEl(null);
        setRedirigirA(`/productos/modificacion/${_id}`);
        router.push(`/productos/modificacion/${_id}`);
    };

    //Se ejecuta al elegir el menú para borrar el producto
    const handleBorrar = () => {
        setAnchorEl(null);
        setProductoABorrar(unProducto);
        setearOpenPopup(true);        
    };

    //Se ejecuta al elegir el menú para ver los pedidos del producto
    const handlePedidos = (_id) => {
        setAnchorEl(null);
        setRedirigirA(`/productos/pedidos/${_id}`);
        router.push(`/productos/pedidos/${_id}`);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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
                <MenuItem onClick = { evento => handleEditar(_id) } >
                    <RiEditLine />&nbsp;{constantes.MENU_EDITAR}
                </MenuItem>
                <MenuItem onClick = { handleBorrar } >
                    <GoTrashcan />&nbsp;{constantes.MENU_BORRAR}
                </MenuItem>
                <MenuItem 
                    disabled = { unProducto.pedidos.length === 0}
                    onClick = { evento => handlePedidos(_id) } 
                >
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
                    onClick = { async () => {      
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