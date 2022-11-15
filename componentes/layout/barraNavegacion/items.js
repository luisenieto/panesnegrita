import { ListItemIcon, Typography, MenuItem } from "@mui/material";
import { TbBread } from 'react-icons/tb';
import { BsCart2 } from 'react-icons/bs';
import { CgComponents } from 'react-icons/cg';
import { BiRuler } from 'react-icons/bi';
import { FiUsers } from 'react-icons/fi';
import classes from './barraNavegacion.module.css';
import { useTheme } from "@emotion/react";

const itemsMenu = [    
    {
        etiqueta : 'Pedidos',
        icono : BsCart2,
        link : '/pedidos/'
    },
    {
        etiqueta : 'Productos',
        icono : TbBread,
        link : '/productos/'
    },
    {
        etiqueta : 'Ingredientes',
        icono : CgComponents,
        link : '/ingredientes/'
    },
    {
        etiqueta : 'Unidades',
        icono : BiRuler,
        link : '/unidades/'
    },
    {
        etiqueta : 'Clientes',
        icono : FiUsers,
        link : '/clientes/'
    }                       
];

//Dado el nombre de una etiqueta (Pedidos, Productos, etc), devuelve el ícono correspondiente
const obtenerComponenteIcono = (nombre) => {
    const resultado = itemsMenu.find(item => item.etiqueta === nombre); 
    return resultado.icono;
}

//componente que muestra los ítems Pedidos, Productos, etc en el menú
const Items = ({itemClic}) => {
    const tema = useTheme();
    return (
        itemsMenu.map((item, i) => {
            const Icono = obtenerComponenteIcono(item.etiqueta);
            return (
                <MenuItem 
                    key = {i}
                    onClick = {() => itemClic(item.etiqueta, item.link)}
                    /*className = {classes.itemMenu}*/
                >
                    <ListItemIcon sx = {{color : tema.palette.secondary.main}}>
                        <Icono /*className = {classes.boton}*/ />
                    </ListItemIcon>
                    <Typography textAlign = 'center'>
                        {item.etiqueta}
                    </Typography>
                </MenuItem>
            )
        })
    )
}

export default Items;
export { itemsMenu };