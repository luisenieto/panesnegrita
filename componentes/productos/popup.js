import { Dialog } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { DialogContent } from '@mui/material';
import { DialogContentText } from '@mui/material';
import { DialogActions } from '@mui/material';
import { Button } from '@mui/material';
import { useTheme } from '@emotion/react';
import { ProveedorContexto } from '../../contexto/proveedor';
import { useContext } from 'react';
import { constantes } from '../../auxiliares/auxiliaresProductos';
import axios from 'axios';

//Componente que muestra el popup donde se confirma el borrado de un producto
const Popup = ({titulo, texto, openPopup, setearOpenPopup, setMensaje}) => {
    const tema = useTheme();
    const { productoABorrar } = useContext(ProveedorContexto);

    const handleAceptar = async () => {        
        const ruta = '/api/productos';
        try {
            const respuestaBorrar = await axios.delete(ruta, {data : productoABorrar});
            const dataBorrar = await respuestaBorrar.data;
            if (dataBorrar.mensaje === constantes.PRODUCTO_BORRADO) { //se pudo borrar el producto
                //ver el tema del refresco
                setMensaje({
                    gravedad : 'success',
                    titulo : constantes.BORRAR_PRODUCTO,
                    texto : constantes.PRODUCTO_BORRADO,
                    mostrar : true
                });
            }
            else {                
                setMensaje({
                    gravedad : 'error',
                    titulo : constantes.BORRAR_PRODUCTO,
                    texto : dataBorrar.mensaje,
                    mostrar : true
                });
            }
        }
        catch(error) {            
            setMensaje({
                gravedad : 'error',
                titulo : constantes.BORRAR_PRODUCTO,
                texto : error.response.data.mensaje || error.message,
                mostrar : true
            });
        }
        setearOpenPopup(false);
    }

    return (
        <Dialog open = {openPopup} onClose = {() => setearOpenPopup(false)}>
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