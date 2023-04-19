import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Button } from '@mui/material';
import { useTheme } from '@emotion/react';
import { constantes } from '../../auxiliares/auxiliaresPedidos';
import { useContext } from 'react';
import { ProveedorContexto } from '../../contexto/proveedor';
import axios from 'axios';


//Componente que muestra el popup donde se confirma la cancelación de un pedido (desde un producto)
const Popup = ({ producto, setProducto, titulo, texto, openPopup, setearOpenPopup, setMensaje }) => {
    const tema = useTheme();
    const { pedidoACancelar } = useContext(ProveedorContexto);

    const handleAceptar = async () => {

        const ruta = '/api/pedidos';
        try {
            const respuestaBorrar = await axios.delete(ruta, {data : pedidoACancelar});
            const dataBorrar = await respuestaBorrar.data;           
            if (dataBorrar.mensaje === constantes.PEDIDO_CANCELADO) { //se pudo cancelar el pedido
                //si se pudo cancelar el pedido, se lo saca del vector de pedidos del producto
                let pedidosUpdate = producto.pedidos;
                const index = pedidosUpdate.indexOf(pedidoACancelar._id);
                pedidosUpdate.splice(index, 1);
                setProducto({
                    ...producto, 
                    pedidos : pedidosUpdate
                });
                setMensaje({
                    gravedad : 'success',
                    titulo : constantes.CANCELAR_PEDIDO,
                    texto : constantes.PEDIDO_CANCELADO,
                    mostrar : true
                });
            }
            else {                
                setMensaje({
                    gravedad : 'error',
                    titulo : constantes.CANCELAR_PEDIDO,
                    texto : dataBorrar.mensaje,
                    mostrar : true
                });
            }
        }
        catch(error) {        
            console.log(error);
            setMensaje({
                gravedad : 'error',
                titulo : constantes.CANCELAR_PEDIDO,
                //texto : error.response.data.mensaje || error.message,
                texto : 'error',
                mostrar : true
            });
        }
        setearOpenPopup(false);
    }


    return (
        <Dialog 
            open = {openPopup} 
            onClose = { () => setearOpenPopup(false) }
        >
            <DialogTitle>{titulo}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {texto}
                </DialogContentText>
                <DialogActions>
                    <Button 
                        sx = {{color : tema.palette.secondary.main}}
                        onClick = { handleAceptar }
                    >
                        {constantes.ACEPTAR}
                    </Button>
                    <Button 
                        sx = {{color : tema.palette.secondary.main}}
                        onClick = {() => setearOpenPopup(false)}
                    >
                        {constantes.CANCELAR}
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    )
}

export default Popup;