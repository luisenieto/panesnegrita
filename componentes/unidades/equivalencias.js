import { Grid, Paper, Typography, Divider, TableContainer, Table, TableBody, TableRow, TableCell, IconButton, Fab } from '@mui/material';
import { GrAdd } from 'react-icons/gr';
import {RiEditLine} from 'react-icons/ri';
import {GoTrashcan} from 'react-icons/go';
import { useTheme } from '@emotion/react';
import { obtenerNombreUnidad } from '../../auxiliares/auxiliaresUnidades';
import { useState } from 'react';
import VentanaDialogo from './ventanaDialogo';
import { useContext } from 'react';
import { ProveedorContexto } from '../../contexto/proveedor';

//Componente que permite ver/crear/modificar equivalencias cuando se crea/modifica una unidad
const Equivalencias = ({leyenda, unidad, setUnidad, mostrar}) => {
    const {unidades} = useContext(ProveedorContexto);
    
    const tema = useTheme();
    const [visible, setVisible] = useState(false);
    //controla la visibilidad de la ventana de diálogo que permite crear/editar una equivalencia

    const [nombreUnidadEquivalencia, setNombreUnidadEquivalencia] = useState(null);
    //es la unidad que se elige en el Autocomplete para definir la equivalencia

    const [proporcion, setProporcion] = useState(null);
    //es la proporción de una unidad para definir la equivalencia

    const [edicion, setEdicion] = useState(false);
    //controla el estado de habilitado del Autocomplete
    //edicion = false: el Autocomplete está habilitado
    //edicion = true: el Autocomplete está deshabilitado

    const [equivalenciaAEditar, setEquivalenciaAEditar] = useState(null);
    //permite editar una determinada equivalencia 
    //(es la posición en el vector de equivalencias de la equivalencia a editar)
    
    const { equivalencias } = unidad;
    
    //se ejecuta al seleccionar el botón que permite definir una nueva equivalencia (+)
    const fabHandler = () => {
        setNombreUnidadEquivalencia(null);
        setEdicion(false);
        setProporcion(null);
        setVisible(true);
    }

    //se ejecuta al borrar una equivalencia
    //falta hacer las comprobaciones
    const handleBorrar = (posicion) => {
        const equivalenciasUpate = [...equivalencias];
        equivalenciasUpate.splice(posicion, 1);
        setUnidad({...unidad, equivalencias : equivalenciasUpate});
    }

    //se ejecuta al editar una equivalencia
    //posición: es la posición de la equivalencia a editar en el vector de equivalencias 
    const handleEditar = (posicion) => {
        setEdicion(true);
        setNombreUnidadEquivalencia(obtenerNombreUnidad(equivalencias[posicion].idUnidad, unidades));        
        setProporcion(equivalencias[posicion].proporcion);
        //sólo se puede editar la proporción
        setEquivalenciaAEditar(posicion);
        setVisible(true);
    }
    
    //si se hace el map y el vector está vacío, al hacer npm run build da un error
    //para solucionar, se puede hacer equivalencias?.map(...)
    //el ? verifica si el vector está vacío o no
    return (
        <>
            <Grid item xs = {12} >
                <Paper variant = "outlined" sx = {{ my: { xs: 1, md: 0 }, p: { xs: 2, md: 2 } }} >
                    <Grid container >
                        <Grid item >
                            <Typography variant = "h6" gutterBottom >
                                {leyenda}
                            </Typography>
                        </Grid>
                        <Grid item >
                            <Divider />
                        </Grid>
                        <Grid item >
                            <TableContainer>
                                <Table>
                                    <TableBody>
                                        {
                                            equivalencias?.map((equivalencia, i) => (
                                                <TableRow key = {i} hover sx = {{'&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell sx = {{width : 2}}>
                                                        <IconButton
                                                            aria-label = "expand row"
                                                            size = "small"
                                                            onClick = {() => handleEditar(i)}
                                                        >
                                                            <RiEditLine />
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell sx = {{width : 2}}>
                                                        <IconButton
                                                            size = 'small'
                                                            onClick = {() => handleBorrar(i)}
                                                        >
                                                            <GoTrashcan />
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell align = 'left' sx = {{width : 300}}>{obtenerNombreUnidad(equivalencia.idUnidad, unidades)}</TableCell>
                                                    <TableCell align = 'right' >{equivalencia.proporcion}</TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>                    
                        <Grid container direction = 'row-reverse' sx = {{marginTop : 1}}>
                            <Fab 
                                size = 'small'
                                disabled = {mostrar || unidad.nombre === '' || unidades.length === 0 ? true : false}
                                color = {tema.palette.primary.main}
                                onClick = {fabHandler}
                            >
                                <GrAdd />
                            </Fab>                              
                        </Grid>                    
                    </Grid>
                </Paper>
            </Grid>        
            <VentanaDialogo 
                visible = {visible}
                setVisible = {setVisible}
                unidad = {unidad}
                setUnidad = {setUnidad}
                nombreUnidadEquivalencia = {nombreUnidadEquivalencia}
                setNombreUnidadEquivalencia = {setNombreUnidadEquivalencia}
                proporcion = {proporcion}
                setProporcion = {setProporcion}
                edicion = {edicion}
                equivalenciaAEditar = {equivalenciaAEditar}
            />
        </>
    )
}

export default Equivalencias;