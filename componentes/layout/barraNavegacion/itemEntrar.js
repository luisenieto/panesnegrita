import { ListItemIcon, Typography, MenuItem } from "@mui/material";
import { FiLogIn } from 'react-icons/fi';
import classes from './barraNavegacion.module.css';
import { useTheme } from "@emotion/react";

//componente que muestra el ítem Entrar en el menú
const ItemEntrar = ({itemClic}) => {
    const tema = useTheme();
    return (
        <MenuItem 
            onClick = {() => itemClic('Entrar', '/autenticacion')}
            /*className = {classes.itemMenu}*/
        >
            <ListItemIcon sx = {{color : tema.palette.secondary.main}} >
                <FiLogIn /*className = {classes.boton}*/ />
            </ListItemIcon>
            <Typography textAlign = 'center'>
                Entrar
            </Typography>
        </MenuItem>
    )
}

export default ItemEntrar;