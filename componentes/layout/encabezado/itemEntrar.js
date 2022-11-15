import Link from "next/link";
import classes from './encabezadoEstilos.module.css';

//Componente que muestra el ítem Entrar en el encabezado
const ItemEntrar = ({enlaceActivo, setEnlaceActivo}) => {
    return (
        <Link href = '/autenticacion'>
            <a
                className = {enlaceActivo === 'Entrar' ? classes.enlaceActivo : classes.enlace}
                onClick = {() => setEnlaceActivo('Entrar')}
            >
                Entrar
            </a>
        </Link>
    )
}

export default ItemEntrar;