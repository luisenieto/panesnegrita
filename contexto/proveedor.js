import { createContext, useState, useEffect } from "react";
//import { unidades as unidades1 } from "../datos/datosUnidades";

export const ProveedorContexto = createContext();

const Proveedor = ({ children }) => {
    const [unidades, setUnidades] = useState([]);
    //lista de todas las unidades

    const [ingredientes, setIngredientes] = useState([]);
    //lista de todos los ingredientes

    const [clientes, setClientes] = useState([]);
    //lista de todos los clientes

    const [unidadABorrar, setUnidadABorrar] = useState(null);
    //unidad que se está por borrar (sirve para el popup que borra una unidad)

    const [ingredienteABorrar, setIngredienteABorrar] = useState(null);
    //ingrediente que se está por borrar (sirve para el popup que borra un ingrediente)

    const [clienteABorrar, setClienteABorrar] = useState(null);
    //cliente que se está por borrar (sirve para el popup que borra un cliente)

    const [productoABorrar, setProductoABorrar] = useState(null);
    //producto que se está por borrar (sirve para el popup que borra un producto)

    const [redirigirA, setRedirigirA] = useState(null);
    //sirve para redirigir a una página en particular
    //Por ejemplo, sin estar logueado se quiere crear una unidad
    //entonces se muestra el formulario para loguearse
    //si el proceso de logueo es exitoso se redirige a la página que permite crear la unidad

    return (
        <ProveedorContexto.Provider value = {{
            unidades, 
            setUnidades,
            ingredientes, 
            setIngredientes,
            clientes, 
            setClientes,
            unidadABorrar, 
            setUnidadABorrar,
            ingredienteABorrar, 
            setIngredienteABorrar,
            clienteABorrar, 
            setClienteABorrar,
            productoABorrar, 
            setProductoABorrar,
            redirigirA, 
            setRedirigirA
        }}>
            {children}
        </ProveedorContexto.Provider>
    )
}

export default Proveedor;