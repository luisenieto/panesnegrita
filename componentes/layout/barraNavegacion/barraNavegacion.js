import { Box, Menu } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from 'next-auth/react';
import BotonHamburguesa from "./botonHamburguesa";
import ItemHome from "./itemHome";
import ItemEntrar from "./itemEntrar";
import ItemSalir from "./itemSalir";
import Items from "./items";

//componente encargado de mostrar la barra de navegación
const BarraNavegacion = ({enlaceActivo, setEnlaceActivo}) => { 
    const { data: sesion, status: estaAveriguando } = useSession(); 
    //a data se le cambia el nombre por sesion, y a status por estaAveriguando
    //useSession() devuelve un objeto con 2 claves
    //data: objeto que describe la sesión actual, el cual puede tomar 3 valores:
        //undefined: cuando todavía no se obtuvo información de la sesión
        //null: cuando ya se obtuvo información de la sesión y la misma muestra que el usuario no está logueado
        //objeto Session: cuando ya se obtuvo información de la sesión y la misma muestra que el usuario sí está logueado

    //status: indica si NextJS está todavía averiguando si el usuario está logueado o no
    //es una enumeración que puede valer "loading", "authenticated" o "unauthenticated"

    //para mostrar en la barra la opción "Entrar": sesion: null, estaAveriguando: "unauthenticated"
    //para mostrar en la barra la opción "Salir": sesion: <objeto> (si sesion ya vale algo
    //no hay necesidad de ver cuanto vale "estaAveriguando" porque ya terminó de averiguar)

    const router = useRouter();

    //const [anchorElNav, setAnchorElNav] = useState(null);
    const [mostrarMenu, setMostrarMenu] = useState(false);

    //const abrirMenuNavegacion = event => setAnchorElNav(event.currentTarget)
    //const abrirMenuNavegacion = event => setMostrarMenu(true);

    // const cerrarMenuNavegacion = () => {  
    //     //setAnchorElNav(null);  
    //     setMostrarMenu(false);
    // };

    //Se ejecuta cuando se selecciona una de la opciones (Home, Pedidos, etc)
    //etiqueta: etiqueta con la opción seleccionada (sirve para el encabezado)
    //link: link a la página a la cual se redirige
    const itemClic = (etiqueta, link) => {        
        router.push(link);   
        setEnlaceActivo(etiqueta);
        setMostrarMenu(false);
        //cerrarMenuNavegacion();
    }

    return (
        <Box sx = {{ flexGrow: 1, display: { xs: 'flex', sm: 'none', lg: 'none' } }} >
            <BotonHamburguesa setMostrarMenu = {setMostrarMenu}/>
            <Menu
                anchorReference = 'anchorPosition'
                anchorPosition = {{ left: 10, top: 54 }}
                // anchorEl = {anchorElNav}                 
                anchorOrigin = {{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                // keepMounted
                transformOrigin = {{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                // open = {Boolean(anchorElNav)}
                open = {mostrarMenu}
                PaperProps = {{
                    style: {
                      left: '50%',
                      transform: 'translateX(-5%) translateY(5%)',
                    }
                }}
                MenuListProps = {{
                    style: {
                      padding: 0,
                    },
                }}                
                //onClose = {cerrarMenuNavegacion}
                onClose = {() => setMostrarMenu(false)}                
                sx = {{
                    display: { xs: 'flex', sm: 'none', md: 'none' },
                }}
            >
                <ItemHome itemClic = {itemClic}/>
                <Items itemClic = {itemClic}/>
                {
                    !sesion && estaAveriguando === 'unauthenticated' && <ItemEntrar itemClic = {itemClic} />
                }
                {
                    sesion && <ItemSalir />
                }
            </Menu>
        </Box>
    )
}

export default BarraNavegacion;