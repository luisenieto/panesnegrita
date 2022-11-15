import { Dialog } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { DialogContent } from '@mui/material';
import { DialogContentText } from '@mui/material';
import { DialogActions } from '@mui/material';
import { Button } from '@mui/material';
import { useTheme } from '@emotion/react';
import axios from 'axios';
import { ProveedorContexto } from "../../contexto/proveedor";
import { useContext } from 'react';
import { constantes } from '../../auxiliares/auxiliaresUnidades';

const Popup = ({titulo, texto, openPopup, setearOpenPopup}) => {
    const tema = useTheme();
    const { unidadABorrar, setUnidades } = useContext(ProveedorContexto);

    const botonAceptarClic = async () => {
        const ruta = '/api/unidades/';
        // try {
        //     const respuestaBorrar = await axios.delete(ruta, {data : unidadABorrar});
        //     const dataBorrar = await respuestaBorrar.data;
        //     if (dataBorrar.mensaje === constantes.UNIDAD_BORRADA) { //se pudo borrar la unidad
        //         const respuestaObtenerUnidades = await axios.get(ruta);
        //         const dataObtenerUnidades = await respuestaObtenerUnidades.data;
        //         if (dataObtenerUnidades.mensaje === constantes.UNIDADES_LEIDAS_CORRECTAMENTE) { //se pudieron leer las unidades después de borrar una
        //             setUnidades(dataObtenerUnidades.unidades); //se actualiza la lista de unidades
        //             setMensaje({
        //                 gravedad : 'success',
        //                 titulo : constantes.BORRAR_UNIDAD,
        //                 texto : constantes.UNIDAD_BORRADA,
        //                 mostrar : true
        //             });
        //         }
        //         else { //no se pudieron leer las unidades después de borrar una
        //             setMensaje({
        //                 gravedad : 'error',
        //                 titulo : constantes.BORRAR_UNIDAD,
        //                 texto : constantes.UNIDAD_BORRADA,
        //                 mostrar : true
        //             });
        //         }
        //     }            
        // }
        // catch(error) {
        //     setMensaje({
        //         gravedad : 'error',
        //         titulo : constantes.BORRAR_UNIDAD,
        //         texto : constantes.UNIDAD_BORRADA,
        //         mostrar : true
        //     });
        // }
        // setearOpenPopup(false);
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
                        onClick = {() => botonAceptarClic()}
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