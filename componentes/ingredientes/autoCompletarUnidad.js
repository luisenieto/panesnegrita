import { Grid, Autocomplete, TextField } from '@mui/material';
import { useEffect, useContext } from 'react';
import axios from 'axios';
import { ProveedorContexto } from '../../contexto/proveedor';

//Componente que muestra la lista de unidades que se pueden elegir para un ingrediente
const AutoCompletarUnidad = ({leyenda, ingrediente, setIngrediente}) => {
    const { unidades, setUnidades } = useContext(ProveedorContexto);

    //Dado el nombre de una unidad, devuelve su _id
    //Si no hay una unidad con el nombre especificado, devuelve null
    const obtenerId = (nombreUnidad) => {
        for(let i in unidades) {
            if (nombreUnidad === unidades[i].nombre)
                return unidades[i]._id;
        }
        return null;
    }

    //Dado el _id de una unidad, devuelve su nombre
    //Si no hay una unidad con el _id especificado, devuelve null
    const obtenerNombre = (_id) => {
        for(let i in unidades) {
            if (_id === unidades[i]._id)
                return unidades[i].nombre;
        }
        return null;
    }

    //la obtención de las unidades se la tiene que hacer dentro del hook useEffect
    //porque el método obtenerUnidades() es async, y por lo tanto al llamarlo habría que usar await
    //para poder usar await, el componente AutoCompletarUnidad debería definirse como async
    //pero eso no se puede
    useEffect(() => {
        //Si todavía no se leyeron las unidades, se las lee
        if (unidades.length === 0) {
            //Obtiene las unidades. Si hubo algún error devuelve un vector vacío
            const obtenerUnidades = async () => {
                const ruta = '/api/unidades/';
                try {
                    const respuesta = await axios.get(ruta);
                    const data = await respuesta.data;                                        
                    setUnidades(data.unidades);
                    //los _id son cadenas
                }
                catch(error) {
                    setUnidades([]);
                }
            }
            obtenerUnidades();
        }        
    }, []); //eslint-disable-line react-hooks/exhaustive-deps 
    //el comentario anterior es para que en la consola no aparezca el warning diciendo que el array de depdencias de useEffect está vacío

    const defaultProps = {
        options: unidades.map(unidad => unidad.nombre)
    };

    const autoCompleteOnChange = (valor) => {
        if (valor !== null && valor.trim() !== '')
            setIngrediente({...ingrediente, idUnidad : obtenerId(valor.trim())});
        if (valor === null)
            setIngrediente({...ingrediente, idUnidad : null});
    }

    return (
        <Grid item lg = {6} sm = {6} xs = {12}>
            <Autocomplete 
                {...defaultProps}
                isOptionEqualToValue = {(option, value) => option.value === value.value}
                //disabled = {edicion ? true : false}
                renderInput = {(params) => <TextField {...params} label = {leyenda} />}
                value = {ingrediente.idUnidad ? obtenerNombre(ingrediente.idUnidad) : null}
                onChange = {(evento, valor) => autoCompleteOnChange(valor)}
            />
        </Grid>
    )
}

export default AutoCompletarUnidad;