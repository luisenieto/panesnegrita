import { Autocomplete, TextField } from '@mui/material';
import { obtenerUnidadesParaEquivalencia } from '../../auxiliares/auxiliaresUnidades';
import { useContext } from 'react';
import { ProveedorContexto } from '../../contexto/proveedor';

//Componente que para la unidad que se está creando/modificando (unidad)
//muestra la lista del resto de unidades que se pueden elegir para establecer una nueva equivalencia
const AutoCompletarUnidad = ({leyenda, unidad, nombreUnidadEquivalencia, setNombreUnidadEquivalencia, edicion}) => {
    const {unidades} = useContext(ProveedorContexto);

    const ordenarPor = 'nombre';
    //sólo se pueden ordenar las unidades por su nombre

    //ordena las unidades alfabéticamente según su nombre
    const comparador = (unidad1, unidad2) => {
        return unidad1[ordenarPor].localeCompare(unidad2[ordenarPor], undefined, { sensitivity: 'base' })
    }

    const unidadesParaEquivalencia = obtenerUnidadesParaEquivalencia(unidad, unidades).slice().sort(comparador);
    //unidades tiene el resto de las unidades que se pueden usar para establecer una nueva equivalencia
    
    const defaultProps = {
        options: unidadesParaEquivalencia.map((unidad) => `${unidad.nombre}`),
    };

    const autoCompleteOnChange = (valor) => {
        setNombreUnidadEquivalencia((valor !== null && valor.trim() !== '') ? valor.trim() : null);
    }

    return (
        <Autocomplete 
            {...defaultProps}
            isOptionEqualToValue = {(option, value) => option.value === value.value}
            // disablePortal
            //disableClearable
            // id = "combo-box-unidades"
            //sx = {{width : 350}}            
            disabled = {edicion ? true : false}
            renderInput = {(params) => <TextField {...params} label = {leyenda} />} 
            value = {nombreUnidadEquivalencia ? nombreUnidadEquivalencia : null}
            onChange = {(evento, valor) => autoCompleteOnChange(valor)}
        />
    )
}

export default AutoCompletarUnidad;