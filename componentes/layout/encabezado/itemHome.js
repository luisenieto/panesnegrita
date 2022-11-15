import Link from "next/link";
import { IconButton } from "@mui/material";
import { BiHome } from 'react-icons/bi';
import classes from './encabezadoEstilos.module.css';
import { useTheme} from "@mui/material";

//Componente que muestra el botón Home en el encabezado
const ItemHome = ({enlaceActivo, setEnlaceActivo}) => {
    const tema = useTheme();
    return (
        <Link href = '/'>
            <IconButton 
                //className = {enlaceActivo === 'Home' ? classes.botonActivo : classes.boton} 
                sx = {{
                    backgroundColor: tema.palette.primary.main,
                    color : tema.palette.secondary.main,
                    '&:hover' : {
                        backgroundColor: tema.palette.primary.light,                        
                    },
                    '&:focus' : {
                        backgroundColor: tema.palette.primary.light                            
                    }
                }}                
                onClick = {() => setEnlaceActivo('Home')}
            >
                <BiHome />
            </IconButton>
        </Link>
    )
}

export default ItemHome;