import { Grid, Autocomplete, TextField, IconButton, Tooltip } from '@mui/material';
import { constantes } from '../../auxiliares/auxiliaresProductos';
import { Fragment, useEffect, useState, useContext } from 'react';
import { ProveedorContexto } from '../../contexto/proveedor';
import axios from 'axios';
import { HiOutlineViewGridAdd } from 'react-icons/hi';
import { GoTrashcan } from 'react-icons/go';
import { obtenerNombreUnidad, obtener_Id } from '../../auxiliares/auxiliaresUnidades';
import { obtenerIdIngrediente, obtenerNombreIngrediente, yaEstaEsteIngrediente } from '../../auxiliares/auxiliaresIngredientesYProductos';
//import { obtenerIdIngrediente, obtenerNombreIngrediente } from '../../auxiliares/auxiliaresIngredientesYProductos';


//Componente que muestra los ingredientes de un producto
const Ingredientes = ({ producto, setProducto, operacion }) => {
    const { unidades, setUnidades } = useContext(ProveedorContexto);

    const [ingredientesYProductos, setIngredientesYProductos] = useState([]);
    //contiene el listado de todos los ingredientes y productos

    //la obtención de los ingredientes (ingredientes y productos en el caso de combos), se la tiene que hacer dentro del hook useEffect
    //porque el método obtenerIngredientesYProductos() es async, y por lo tanto al llamarlo habría que usar await
    //para poder usar await, el componente AutoCompletarCliente debería definirse como async
    //pero eso no se puede
    useEffect(() => {           
        //Obtiene los ingredientes y productos (en el caso de combos). Si hubo algún error devuelve un vector vacío
        const obtenerIngredientesYProductos = async () => {
            //let ingredientesYProductosUpdate = [];
    
            //Se leen los ingredientes y productos
            let ruta = '/api/ingredientesYProductos/';
            try {
                const respuesta = await axios.get(ruta);
                const data = await respuesta.data;
                setIngredientesYProductos(data.ingredientesYProductos); //los _id son String                           
            }
            catch(error) {
                setIngredientesYProductos([]);  
            }    
        } 
        
        //Obtiene las unidades
        const obtenerUnidades = async () => {
            //Se leen las unidades
            let ruta = '/api/unidades';
            try {
                const respuesta = await axios.get(ruta);
                const data = await respuesta.data;                
                setUnidades(data.unidades);  //los _id son String                          
            }
            catch(error) {
                setUnidades([]);  
            } 
        }

        obtenerIngredientesYProductos(); 
        if (unidades.length === 0)
            obtenerUnidades();

    }, []); //eslint-disable-line react-hooks/exhaustive-deps 
    //el comentario anterior es para que en la consola no aparezca el warning diciendo que el array de depdencias de useEffect está vacío

    
    const defaultPropsIngredientes = {
        options: ingredientesYProductos.map(ingredienteYProducto => ingredienteYProducto.nombre)
    };

    const defaultPropsUnidades = {
        options: unidades.map(unidad => unidad.nombre)
    };

    //Se ejecuta cada vez que se presiona una tecla en el campo "Cantidad"
    const cantidadOnKeyDown = (evento) => {
        var charCode = (evento.which) ? evento.which : evento.keyCode;         
        //charCode = 107: + (teclado numérico)
        //charCode = 109: - (teclado numérico)
        //charCode = 187: + (teclado normal)
        //charCode = 189: - (teclado normal)
        //No se permite escribir + ni -
        if (charCode === 107 || charCode === 109 || charCode === 187 || charCode === 189)
            evento.preventDefault();
    }

    const autoCompleteIngredienteOnChange = (valor, posicion) => {
        const ingredientesUpdate = [...producto.ingredientes];
        if (valor !== null && valor.trim() !== '') {            
            ingredientesUpdate[posicion].idIngrediente = obtenerIdIngrediente(valor, ingredientesYProductos);
            setProducto({...producto, ingredientes : ingredientesUpdate});
        }
        if (valor === null) {
            ingredientesUpdate[posicion].idIngrediente = null;
            setProducto({...producto, ingredientes : ingredientesUpdate});
        }
    }

    const autoCompleteUnidadOnChange = (valor, posicion) => {
        const ingredientesUpdate = [...producto.ingredientes];
        if (valor !== null && valor.trim() !== '') {            
            ingredientesUpdate[posicion].idUnidad = obtener_Id(valor, unidades);
            setProducto({...producto, ingredientes : ingredientesUpdate});
        }
        if (valor === null) {
            ingredientesUpdate[posicion].idUnidad = null;
            setProducto({...producto, ingredientes : ingredientesUpdate});
        }
    }

    //Se ejecuta cuando se selecciona el botón para agregar un nuevo ingrediente
    const agregarIngrediente = () => {
        const ingredientesUpdate = [...producto.ingredientes];
        ingredientesUpdate.push({
            idIngrediente : null,
            cantidad : 1,
            idUnidad : null
        });
        setProducto({...producto, ingredientes : ingredientesUpdate});
    }

    //Se ejecuta cuando se selecciona el botón para borrar un ingrediente
    const borrarIngrediente = (posicion) => {
        const ingredientesUpdate = [...producto.ingredientes]; 
        ingredientesUpdate.splice(posicion, 1);
        setProducto({...producto, ingredientes : ingredientesUpdate});
    }

    //Se ejecuta cuando se modifica la cantidad de un ingrediente
    const cantidadOnChange = (valor, posicion) => {
        const ingredientesUpdate = [...producto.ingredientes];
        ingredientesUpdate[posicion].cantidad = valor !== '' ? parseFloat(valor) : 1;
        setProducto({...producto, ingredientes : ingredientesUpdate});        
    }
    
    return (
        <>
            {
                producto.ingredientes.map((ingrediente, i) => (
                    <Fragment key = {i}>
                        <Grid item lg = {4} sm = {4} xs = {9}>
                            <Autocomplete 
                                {...defaultPropsIngredientes}
                                isOptionEqualToValue = {(option, value) => option.value === value.value}
                                renderInput = {(params) => <TextField {...params} label = {constantes.INGREDIENTE} />}
                                getOptionDisabled = { opcion => opcion === yaEstaEsteIngrediente(opcion, producto.ingredientes, ingredientesYProductos) || opcion === producto.nombre }
                                value = {ingrediente.idIngrediente ? obtenerNombreIngrediente(ingrediente.idIngrediente, ingredientesYProductos) : null}
                                onChange = {(evento, valor) => autoCompleteIngredienteOnChange(valor, i)}
                            />
                        </Grid>
                        <Grid item lg = {2} sm = {2} xs = {3}>
                            <TextField
                                required
                                label = 'Cantidad'
                                fullWidth                
                                variant = "outlined"
                                type = 'Number'
                                value = {ingrediente.cantidad}
                                inputProps = {{
                                    min : 1,
                                    style : {textAlign : 'center'},
                                    onKeyDown : (evento) => { cantidadOnKeyDown(evento) }
                                }}
                                onChange = { evento => cantidadOnChange(evento.target.value, i) }
                            />
                        </Grid>
                        <Grid item lg = {4} sm = {4} xs = {8}>
                            <Autocomplete 
                                {...defaultPropsUnidades}
                                isOptionEqualToValue = {(option, value) => option.value === value.value}
                                renderInput = {(params) => <TextField {...params} label = {constantes.UNIDAD} />}
                                value = {ingrediente.idUnidad ? obtenerNombreUnidad(ingrediente.idUnidad, unidades) : null}
                                onChange = {(evento, valor) => autoCompleteUnidadOnChange(valor, i)}
                            />
                        </Grid>
                        <Grid item lg = {1} sm = {1} xs = {2} >
                            <Tooltip title = {constantes.AGREGAR_INGREDIENTE} placement = 'top'>
                                <span>
                                    <IconButton
                                        size = 'small'
                                        onClick = { agregarIngrediente }                                        
                                    >
                                        <HiOutlineViewGridAdd />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Grid item lg = {1} sm = {1} xs = {2}>
                            <Tooltip title = {constantes.BORRAR_INGREDIENTE} placement = 'top'>
                                <span>
                                    <IconButton
                                        size = 'small'
                                        onClick = {() => borrarIngrediente(i)}                                        
                                        disabled = {producto.ingredientes.length === 1 ? true : false}
                                    >
                                        <GoTrashcan />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                    </Fragment>
                ))
            }
        </>        
    )
}

export default Ingredientes;