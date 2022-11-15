import { ListItemIcon, Typography, MenuItem } from "@mui/material";
import { FiLogOut } from 'react-icons/fi';
import classes from './barraNavegacion.module.css';
import { signOut } from 'next-auth/react';
import { useTheme } from "@emotion/react";

//componente que muestra el ítem Salir en el menú
const ItemSalir = () => {
    const tema = useTheme();
    return (
        <MenuItem 
            onClick = {signOut}
            /*className = {classes.itemMenu}*/
        >
            <ListItemIcon sx = {{color : tema.palette.secondary.main}}>
                <FiLogOut /*className = {classes.boton}*/ />
            </ListItemIcon>
            <Typography textAlign = 'center'>
                Salir
            </Typography>
        </MenuItem>
    )
}

export default ItemSalir;