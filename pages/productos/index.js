import { Fragment } from "react";
import Etiqueta from "../../componentes/comunes/etiqueta";

const Productos = (props) => {
    return (
        <Fragment>
            <Etiqueta variant = "ghost" color = {'error'}>
                Error
            </Etiqueta>
            <Etiqueta variant = "ghost" color = {'success'}>
                Exito
            </Etiqueta>
            <Etiqueta variant = "ghost" color = {'warning'}>
                Advertencia
            </Etiqueta>
        </Fragment>
    )
}



export default Productos;