import { MenuItem, ListItemIcon } from "@mui/material";
import { BiHome } from 'react-icons/bi';
import classes from './barraNavegacion.module.css';
import { useTheme } from "@emotion/react";

//componente que muestra el ítem Home en el menú
const ItemHome = ({itemClic}) => {
    const tema = useTheme();
    return (
        <MenuItem /*className = {classes.itemMenu}*/ onClick = {() => itemClic('Home', '/')} >
            <ListItemIcon sx = {{color : tema.palette.secondary.main}}>
                <BiHome /*className = {classes.boton}*/ />
            </ListItemIcon>
        </MenuItem>
    )
}

export default ItemHome;