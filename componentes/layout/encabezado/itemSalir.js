import { Button } from "@mui/material";
import classes from './encabezadoEstilos.module.css';
import { signOut } from 'next-auth/react';
import Link from '../../../componentes/link';

//Componente que muestra el ítem Salir en el encabezado
const ItemSalir = () => {
    // return (
    //     <Link
    //         tipo = 'boton'
    //         sx = {{color : 'white'}}
    //         variant = 'text'
    //         onClick = {signOut}
    //     >
    //     </Link>
    // )

    return (
        <Button 
            /* className = {classes.botonSalir} */
            sx = {{color : 'black'}}
            variant = 'text' 
            onClick = {signOut}
        >
            Salir
        </Button>
    )
}

export default ItemSalir;