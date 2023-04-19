import { Grid, Autocomplete, TextField } from '@mui/material';
import { ProveedorContexto } from '../../contexto/proveedor';
import { useEffect, useContext } from 'react';
import { obtenerIdProducto, obtenerCadenaProducto } from '../../auxiliares/auxiliaresProductos';
import axios from 'axios';


//Componente que muestra la lista de productos que se pueden elegir para un pedido
const AutoCompletarProducto = ({leyenda, pedido, setPedido}) => {
    const { productos, setProductos } = useContext(ProveedorContexto);

    //la obtención de los productos se la tiene que hacer dentro del hook useEffect
    //porque el método obtenerProductos() es async, y por lo tanto al llamarlo habría que usar await
    //para poder usar await, el componente AutoCompletarProducto debería definirse como async
    //pero eso no se puede
    useEffect(() => {
        //Si todavía no se leyeron los productos, se los lee        
        if (productos.length === 0) {            
            //Obtiene los productos. Si hubo algún error devuelve un vector vacío
            const obtenerProductos = async () => {
                const ruta = '/api/productos/';
                try {
                    const respuesta = await axios.get(ruta);
                    const data = await respuesta.data; 
                    setProductos(data.productos);
                    //los _id son cadenas
                }
                catch(error) {
                    setProductos([]);
                }
            }
            obtenerProductos();
        } 
    }, []); //eslint-disable-line react-hooks/exhaustive-deps 
    //el comentario anterior es para que en la consola no aparezca el warning diciendo que el array de depdencias de useEffect está vacío

    const defaultProps = {
        options: productos.map(producto => producto.nombre)
    };

    const autoCompleteOnChange = (valor) => {
        if (valor !== null && valor.trim() !== '')
            setPedido({...pedido, idProducto : obtenerIdProducto(valor.trim(), productos)});
        if (valor === null)
            setPedido({...pedido, idProducto : null});
    }

    return (
        <Grid item lg = {6} sm = {6} xs = {12}>
            <Autocomplete 
                {...defaultProps}
                isOptionEqualToValue = {(option, value) => option.value === value.value}
                //disabled = {edicion ? true : false}
                renderInput = {(params) => <TextField {...params} label = {leyenda} />}
                value = {pedido.idProducto ? obtenerCadenaProducto(pedido.idProducto, productos) : null}
                onChange = {(evento, valor) => autoCompleteOnChange(valor)}
            />
        </Grid>
    )
}

export default AutoCompletarProducto;