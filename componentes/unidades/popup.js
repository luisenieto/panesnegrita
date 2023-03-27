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

//Componente que muestra el popup donde se confirma el borrado de una unidad
const Popup = ({titulo, texto, openPopup, setearOpenPopup, setMensaje}) => {
    const tema = useTheme();
    const { unidadABorrar, setUnidades } = useContext(ProveedorContexto);

    //Actualiza las unidades después de borrar una
    const actualizarUnidades = async (ruta) => {
        const respuestaObtenerUnidades = await axios.get(ruta);
        const dataObtenerUnidades = await respuestaObtenerUnidades.data;
        if (dataObtenerUnidades.mensaje === constantes.UNIDADES_LEIDAS_CORRECTAMENTE) { //se pudieron leer las unidades después de borrar una
            setUnidades(dataObtenerUnidades.unidades); 
            setMensaje({
                gravedad : 'success',
                titulo : constantes.BORRAR_UNIDAD,
                texto : constantes.UNIDAD_BORRADA,
                mostrar : true
            });
        }
        else { //no se pudieron leer las unidades después de borrar una
            setMensaje({
                gravedad : 'error',
                titulo : constantes.BORRAR_UNIDAD,
                texto : dataObtenerUnidades.mensaje,
                mostrar : true
            });
        }
    }

    const handleAceptar = async () => {
        const ruta = '/api/unidades/';
        try {
            const respuestaBorrar = await axios.delete(ruta, {data : unidadABorrar});
            const dataBorrar = await respuestaBorrar.data;
            if (dataBorrar.mensaje === constantes.UNIDAD_BORRADA) { //se pudo borrar la unidad
                // setUnidades([]); 
                // setMensaje({
                //     gravedad : 'success',
                //     titulo : constantes.BORRAR_UNIDAD,
                //     texto : dataBorrar.mensaje,
                //     mostrar : true
                // });

                //se actualiza la lista de unidades
                await actualizarUnidades(ruta);
                // const respuestaObtenerUnidades = await axios.get(ruta);
                // const dataObtenerUnidades = await respuestaObtenerUnidades.data;
                // if (dataObtenerUnidades.mensaje === constantes.UNIDADES_LEIDAS_CORRECTAMENTE) { //se pudieron leer las unidades después de borrar una
                //     setUnidades(dataObtenerUnidades.unidades); 
                //     setMensaje({
                //         gravedad : 'success',
                //         titulo : constantes.BORRAR_UNIDAD,
                //         texto : constantes.UNIDAD_BORRADA,
                //         mostrar : true
                //     });
                // }
                // else { //no se pudieron leer las unidades después de borrar una
                //     setMensaje({
                //         gravedad : 'error',
                //         titulo : constantes.BORRAR_UNIDAD,
                //         texto : dataObtenerUnidades.mensaje,
                //         mostrar : true
                //     });
                // }
            }
            else {
                setMensaje({
                    gravedad : 'error',
                    titulo : constantes.BORRAR_UNIDAD,
                    texto : dataBorrar.mensaje,
                    mostrar : true
                });
            }            
        }
        catch(error) {
            setMensaje({
                gravedad : 'error',
                titulo : constantes.BORRAR_UNIDAD,
                texto : error.response.data.mensaje || error.message,
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