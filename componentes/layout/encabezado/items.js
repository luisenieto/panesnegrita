import { itemsMenu } from "../barraNavegacion/items";
import Link from "next/link";
//import Link from '../../../componentes/link';
import classes from './encabezadoEstilos.module.css';

//componente que muestra los ítems Pedidos, Productos, etc en el encabezado
const Items = ({enlaceActivo, setEnlaceActivo}) => {
    return (
        itemsMenu.map((item, i) => {
            // return (
            //     <Link
            //         key = {i}
            //         href = {item.link}
            //         onClick = {() => setEnlaceActivo(item.etiqueta)}  
            //     >
            //         {item.etiqueta}
            //     </Link>
            // )

            return (
                <Link 
                    key = {i} 
                    href = {item.link}                                                     
                >                            
                    <a 
                        className = {enlaceActivo === item.etiqueta ? classes.enlaceActivo : classes.enlace}
                        onClick = {() => setEnlaceActivo(item.etiqueta)}                                   
                    >
                        {item.etiqueta}
                    </a>                            
                </Link>                        
            )
        })
    )
}

export default Items;