import { createContext, useState, useEffect } from "react";
//import { unidades as unidades1 } from "../datos/datosUnidades";

export const ProveedorContexto = createContext();

const Proveedor = ({ children }) => {
    const [unidades, setUnidades] = useState([]);
    //lista de todas las unidades

    const [unidadABorrar, setUnidadABorrar] = useState(null);
    //unidad que se está por borrar (sirve para el popup que borra una unidad)

    return (
        <ProveedorContexto.Provider value = {{
            unidades, 
            setUnidades,
            unidadABorrar, 
            setUnidadABorrar
        }}>
            {children}
        </ProveedorContexto.Provider>
    )
}

export default Proveedor;