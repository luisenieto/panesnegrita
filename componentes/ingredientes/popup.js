import { Dialog } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { DialogContent } from '@mui/material';
import { DialogContentText } from '@mui/material';
import { DialogActions } from '@mui/material';
import { Button } from '@mui/material';
import { useTheme } from '@emotion/react';
import { ProveedorContexto } from '../../contexto/proveedor';
import { useContext } from 'react';
import { constantes } from '../../auxiliares/auxiliaresIngredientes';
import axios from 'axios';


const Popup = ({titulo, texto, openPopup, setearOpenPopup, setMensaje}) => {
    const tema = useTheme();
    const { ingredienteABorrar, setUnidades } = useContext(ProveedorContexto);

    const handleAceptar = async () => {        
        const ruta = '/api/ingredientes';
        try {
            const respuestaBorrar = await axios.delete(ruta, {data : ingredienteABorrar});
            const dataBorrar = await respuestaBorrar.data;
            if (dataBorrar.mensaje === constantes.INGREDIENTE_BORRADO) { //se pudo borrar el ingrediente
                //ver el tema del refresco
                setMensaje({
                    gravedad : 'success',
                    titulo : constantes.BORRAR_INGREDIENTE,
                    texto : constantes.INGREDIENTE_BORRADO,
                    mostrar : true
                });
            }
            else {                
                setMensaje({
                    gravedad : 'error',
                    titulo : constantes.BORRAR_INGREDIENTE,
                    texto : dataBorrar.mensaje,
                    mostrar : true
                });
            }
        }
        catch(error) {            
            setMensaje({
                gravedad : 'error',
                titulo : constantes.BORRAR_INGREDIENTE,
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
                        Aceptar
                    </Button>
                    <Button 
                        sx = {{color : tema.palette.secondary.main}}
                        onClick = {() => setearOpenPopup(false)}
                    >
                        Cancelar
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    )
}

export default Popup;