import { Grid, Autocomplete, TextField } from '@mui/material';
import { ProveedorContexto } from '../../contexto/proveedor';
import { useEffect, useContext } from 'react';
import axios from 'axios';


//Componente que muestra la lista de clientes que se pueden elegir para un pedido
const AutoCompletarCliente = ({leyenda, pedido, setPedido}) => {
    const { clientes, setClientes } = useContext(ProveedorContexto);

    //la obtención de los clientes se la tiene que hacer dentro del hook useEffect
    //porque el método obtenerClientes() es async, y por lo tanto al llamarlo habría que usar await
    //para poder usar await, el componente AutoCompletarCliente debería definirse como async
    //pero eso no se puede
    useEffect(() => {
        //Si todavía no se leyeron los clientes, se los lee        
        if (clientes.length === 0) {            
            //Obtiene los clientes. Si hubo algún error devuelve un vector vacío
            const obtenerClientes = async () => {
                const ruta = '/api/clientes/';
                try {
                    const respuesta = await axios.get(ruta);
                    const data = await respuesta.data; 
                    //console.log(data);
                    setClientes(data.clientes);
                    //los _id son cadenas
                }
                catch(error) {
                    setClientes([]);
                }
            }
            obtenerClientes();
        } 
    }, []); //eslint-disable-line react-hooks/exhaustive-deps 
    //el comentario anterior es para que en la consola no aparezca el warning diciendo que el array de depdencias de useEffect está vacío

    const defaultProps = {
        options: clientes.map(cliente => cliente.apellido + ', ' + cliente.nombre + ' (' + cliente.referencia + ')')
    };

    //Dada una cadena que representa un cliente de la forma "apellido, nombre (referencia)", 
    //devuelve el idCliente correspondiente (como un String)
    //Si no hay un cliente con esos datos, devuelve null
    const obtenerIdCliente = (cadenaCliente) => {
        for(let i in clientes) {
            if (cadenaCliente === clientes[i].apellido + ', ' + clientes[i].nombre + ' (' + clientes[i].referencia + ')')
                return clientes[i]._id;
        }
        return null;
    }

    //Dado el idCliente, devuelve una cadena de la forma "apellido, nombre (referencia)"
    //Si no hay un cliente con el idCliente especificado, devuelve null
    const obtenerCadenaCliente = (idCliente) => {
        for(let i in clientes) {
            if (idCliente === clientes[i]._id)
                return clientes[i].apellido + ', ' + clientes[i].nombre + ' (' + clientes[i].referencia + ')';
        }
        return null;
    }

    const autoCompleteOnChange = (valor) => {
        if (valor !== null && valor.trim() !== '')
            setPedido({...pedido, idCliente : obtenerIdCliente(valor.trim())});
        if (valor === null)
            setPedido({...pedido, idCliente : null});
    }

    return (
        <Grid item lg = {6} sm = {6} xs = {12}>
            <Autocomplete 
                {...defaultProps}
                isOptionEqualToValue = {(option, value) => option.value === value.value}
                //disabled = {edicion ? true : false}
                renderInput = {(params) => <TextField {...params} label = {leyenda} />}
                value = {pedido.idCliente ? obtenerCadenaCliente(pedido.idCliente) : null}
                onChange = {(evento, valor) => autoCompleteOnChange(valor)}
            />
        </Grid>
    )
}

export default AutoCompletarCliente;