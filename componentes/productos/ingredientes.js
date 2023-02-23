import { Grid, Autocomplete, TextField, IconButton, Tooltip } from '@mui/material';
import { constantes } from '../../auxiliares/auxiliaresProductos';
import { Fragment, useEffect, useState, useContext } from 'react';
import { ProveedorContexto } from '../../contexto/proveedor';
import axios from 'axios';
import { HiOutlineViewGridAdd } from 'react-icons/hi';
import { RiEditLine } from 'react-icons/ri';
import { GoTrashcan } from 'react-icons/go';


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
        //charCode = 9: tab
        //charCode = 107: + (teclado numérico)
        //charCode = 109: - (teclado numérico)
        //charCode = 187: + (teclado normal)
        //charCode = 189: - (teclado normal)
        //No se permite escribir + ni -
        if (charCode === 107 || charCode === 109 || charCode === 187 || charCode === 189)
            evento.preventDefault();
    }

    //Dado el _id de un ingrediente (ingrediente propiamente dicho o producto), devuelve su nombre
    //Si no hay un ingrediente con el _id especificado, devuelve null
    const obtenerNombreIngrediente = (idIngrediente) => {        
        for(let i in ingredientesYProductos) {
            if (idIngrediente === ingredientesYProductos[i].idIngrediente)
                return ingredientesYProductos[i].nombre;
        }
        return null;
    }

    //Dado el _id de una unidad, devuelve su nombre
    //Si no hay una unidad con el _id especificado, devuelve null
    const obtenerNombreUnidad = (idUnidad) => {
        for(let i in unidades) {
            if (idUnidad === unidades[i]._id)
                return unidades[i].nombre;
        }
        return null;
    }

    //Dado el nombre de un ingrediente (ingrediente propiamente dicho o producto), devuelve su _id
    //Si no hay un ingrediente con el nombre especificado, devuelve null
    const obtenerIdIngrediente = (nombreIngrediente) => {
        for(let i in ingredientesYProductos) {
            if (nombreIngrediente === ingredientesYProductos[i].nombre)
                return ingredientesYProductos[i].idIngrediente;
        }
        return null;
    }

    //Dado el nombre de una unidad, devuelve su _id
    //Si no hay una unidad con el nombre especificado, devuelve null
    const obtenerIdUnidad = (nombreUnidad) => {
        for(let i in unidades) {
            if (nombreUnidad === unidades[i].nombre)
                return unidades[i]._id;
        }
        return null;
    }

    const autoCompleteIngredienteOnChange = (valor, posicion) => {
        const ingredientesUpdate = [...producto.ingredientes];
        if (valor !== null && valor.trim() !== '') {            
            ingredientesUpdate[posicion].idIngrediente = obtenerIdIngrediente(valor);
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
            ingredientesUpdate[posicion].idUnidad = obtenerIdUnidad(valor);
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

    //Permite tener la cantidad del ingrediente como un número float o int
    //Si textoCantidad vale ".7", le agrega un 0 ("0.7"), lo transforma a float y lo devuelve
    //Si textoCantidad vale "0.7", lo transforma a float y lo devuelve
    //Si textoCantidad vale "7", lo transforma a int y lo devuelve
    const transformarANumero = (textoCantidad) => {
        let cantidadCorregida = textoCantidad;
        if (textoCantidad === '')
            return 0;
        if (textoCantidad.startsWith('.')) {        
            cantidadCorregida = '0' + textoCantidad;
        }
        if (cantidadCorregida.includes('.')) //es un float
            return parseFloat(cantidadCorregida);
        else //es un int
            return parseInt(cantidadCorregida);
    }

    //Se ejecuta cuando se modifica la cantidad de un ingrediente
    const cantidadOnChange = (valor, posicion) => {
        const ingredientesUpdate = [...producto.ingredientes];
        ingredientesUpdate[posicion].cantidad = transformarANumero(valor);
        setProducto({...producto, ingredientes : ingredientesUpdate});        
    }
    
    return (
        <>
            {
                producto.ingredientes.map((ingrediente, i) => (
                    <Fragment key = {i}>
                        <Grid item lg = {4} sm = {9} xs = {12}>
                            <Autocomplete 
                                {...defaultPropsIngredientes}
                                isOptionEqualToValue = {(option, value) => option.value === value.value}
                                //disabled = {edicion ? true : false}
                                renderInput = {(params) => <TextField {...params} label = {constantes.INGREDIENTE} />}
                                value = {ingrediente.idIngrediente ? obtenerNombreIngrediente(ingrediente.idIngrediente) : null}
                                onChange = {(evento, valor) => autoCompleteIngredienteOnChange(valor, i)}
                            />
                        </Grid>
                        <Grid item lg = {2} sm = {3} xs = {3}>
                            <TextField
                                required
                                label = 'Cantidad'
                                fullWidth                
                                variant = "outlined"
                                type = 'Number'
                                value = {ingrediente.cantidad}
                                inputProps = {{
                                    //disabled : mostrar,
                                    min : 1,
                                    style : {textAlign : 'center'},
                                    onKeyDown : (evento) => { cantidadOnKeyDown(evento) }
                                }}
                                onChange = { evento => cantidadOnChange(evento.target.value, i) }
                            />
                        </Grid>
                        <Grid item lg = {3} sm = {6} xs = {9}>
                            <Autocomplete 
                                {...defaultPropsUnidades}
                                isOptionEqualToValue = {(option, value) => option.value === value.value}
                                //disabled = {edicion ? true : false}
                                renderInput = {(params) => <TextField {...params} label = {constantes.UNIDAD} />}
                                value = {ingrediente.idUnidad ? obtenerNombreUnidad(ingrediente.idUnidad) : null}
                                onChange = {(evento, valor) => autoCompleteUnidadOnChange(valor, i)}
                            />
                        </Grid>
                        <Grid item lg = {1} sm = {2} xs = {2} >
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
                        <Grid item lg = {1} sm = {2} xs = {2}>
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
                        <Grid item lg = {1} sm = {2} xs = {2}>
                            <Tooltip title = {constantes.MODIFICAR_INGREDIENTE} placement = 'top'>
                                <span>
                                    <IconButton
                                        size = 'small'
                                        //onClick = {() => mostrarVentanaDialogo(false, i)}                                        
                                        disabled = {operacion === 'A' ? true : false}
                                    >
                                        <RiEditLine />
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