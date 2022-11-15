import { IconButton } from "@mui/material";
import { GiHamburgerMenu } from "react-icons/gi";
import { useTheme } from "@emotion/react";

//componente que muestra el ícono con el botón hamburguesa del menú
const BotonHamburguesa = ({setMostrarMenu}) => {
    const tema = useTheme();
    return (
        <IconButton
            size = 'large'
            aria-label = 'menu'
            aria-controls = 'menu-appbar'
            aria-haspopup = 'true'
            onClick = {e => setMostrarMenu(true)}
            sx = {{
                backgroundColor: tema.palette.primary.main,
                color : tema.palette.secondary.main,
                
            }}
        >
            <GiHamburgerMenu />
        </IconButton>
    )
}

export default BotonHamburguesa;