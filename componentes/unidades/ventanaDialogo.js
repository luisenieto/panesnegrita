import { Dialog, DialogTitle, DialogContent, Box, FormControl, DialogActions, Button } from '@mui/material';
import AutoCompletarUnidad from '../../componentes/unidades/autoCompletarUnidad';
import CampoProporcion from '../../componentes/unidades/campoProporcion';
import { obtener_Id, esProporcionValida } from '../../auxiliares/auxiliaresUnidades';
import { useTheme } from '@emotion/react';
import { useContext } from 'react';
import { ProveedorContexto } from '../../contexto/proveedor';
import { constantes } from '../../auxiliares/auxiliaresUnidades';

//Componente que muestra la ventana de diálogo que permite crear/editar una equivalencia
//visible: determina si se muestra/oculta la ventana de diálogo
//setVisible: permite mostrar/ocultar la ventana de diálogo
//unidad: unidad a la cual se le están definiendo las equivalencias
//setUnidad: permite agregar/editar una equivalencia
//nombreUnidadEquivalencia: es el nombre de la unidad de equivalencia que se va a agregar
//setNombreUnidadEquivalencia: permite agregar una nueva equivalencia
//proporcion: proporción de la equivalencia que se va a editar
//setProporcion: permite editar la proporción de la equivalencia
//edicion: permite habilitar/deshabilitar el AutoComplete (cuando se define una equivalencia se habilita, y cuando se edita se deshabilita)
//equivalenciaAEditar: posición en el vector de equivalencias de la equivalencia a editar
const VentanaDialogo = ({visible, setVisible, unidad, setUnidad, nombreUnidadEquivalencia, setNombreUnidadEquivalencia, proporcion, setProporcion, edicion, equivalenciaAEditar}) => {
    const {unidades} = useContext(ProveedorContexto);    
    const tema = useTheme();

    //se ejecuta al cerrar la ventana
    const handleClose = () => {
        setVisible(false);
    }

    //se ejecuta al seleccionar "Aceptar"
    const handleAceptar = () => {
        let equivalenciasUpate = [...unidad.equivalencias];
        if (!edicion) { //se está definiendo una nueva equivalencia            
            const nuevaEquivalencia = {
                _id : obtener_Id(nombreUnidadEquivalencia, unidades),
                proporcion
            }
            equivalenciasUpate.push(nuevaEquivalencia);
            setUnidad({...unidad, equivalencias : equivalenciasUpate});
        }
        else //se está editando una equivalencia
            equivalenciasUpate[equivalenciaAEditar].proporcion = proporcion;
        setUnidad({...unidad, equivalencias : equivalenciasUpate});
        handleClose();
    }        

    return (
        <Dialog disableEscapeKeyDown open = {visible} onClose = {handleClose} >
            <DialogTitle>Nueva equivalencia</DialogTitle>
            <DialogContent>
                <Box component = "form" sx = {{ display: 'flex', flexWrap: 'wrap' }} >
                    <FormControl sx = {{ m: 1, width: 200 }}>
                        <AutoCompletarUnidad 
                            leyenda = {constantes.UNIDAD}
                            unidad = {unidad} 
                            nombreUnidadEquivalencia = {nombreUnidadEquivalencia}
                            setNombreUnidadEquivalencia = {setNombreUnidadEquivalencia}
                            edicion = {edicion}
                        />
                    </FormControl>
                    <FormControl sx = {{ m: 1, width: 120 }}>
                        <CampoProporcion 
                            leyenda = {constantes.PROPORCION}
                            proporcion = {proporcion}
                            setProporcion = {setProporcion}
                        />
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    disabled = {nombreUnidadEquivalencia === null || !esProporcionValida(proporcion) ? true : false} 
                    sx = {{color : tema.palette.secondary.main}}
                    onClick = {handleAceptar}                    
                >
                    {constantes.ACEPTAR}
                </Button>
                <Button 
                    onClick = {handleClose} 
                    sx = {{color : tema.palette.secondary.main}}
                >
                    {constantes.CANCELAR}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default VentanaDialogo;