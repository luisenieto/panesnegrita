import { Box } from "@mui/material";
import { useSession } from 'next-auth/react';
import ItemHome from "./itemHome";
import Items from "./items";
import ItemEntrar from "./itemEntrar";
import ItemSalir from "./itemSalir";

const Encabezado = ({enlaceActivo, setEnlaceActivo}) => {
    //const [enlaceActivo, setEnlaceActivo] = useState('Home');    
    //const [sesion, estaAveriguando] = useSession();
    const { data: sesion, status: estaAveriguando } = useSession(); 
    //a data se le cambia el nombre por sesion, y a status por estaAveriguando
    //useSession() devuelve un objeto con 2 claves
    //data: objeto que describe la sesión actual, el cual puede tomar 3 valores:
        //undefined: cuando todavía no se obtuvo información de la sesión
        //null: cuando ya se obtuvo información de la sesión y la misma muestra que el usuario no está logueado
        //objeto Session: cuando ya se obtuvo información de la sesión y la misma muestra que el usuario sí está logueado

    //status: indica si NextJS está todavía averiguando si el usuario está logueado o no
    //es una enumeración que puede valer "loading", "authenticated" o "unauthenticated"

    //para mostrar en el encabezado la opción "Entrar": sesion: null, estaAveriguando: "unauthenticated"
    //para mostrar en el encabezado la opción "Salir": sesion: <objeto> (si sesion ya vale algo
    //no hay necesidad de ver cuanto vale "estaAveriguando" porque ya terminó de averiguar)
    
    return (
        <Box sx = {{ flexGrow: 1, display: { xs: 'none', sm: 'flex', lg: 'flex' } }}>
            <ItemHome 
                enlaceActivo = {enlaceActivo} 
                setEnlaceActivo = {setEnlaceActivo}
            />
            <Items enlaceActivo = {enlaceActivo} setEnlaceActivo = {setEnlaceActivo}/>
            {
                !sesion && estaAveriguando === 'unauthenticated' && 
                    <ItemEntrar 
                        enlaceActivo = {enlaceActivo} 
                        setEnlaceActivo = {setEnlaceActivo}
                    />
            }
            {
                sesion && <ItemSalir />
            }
        </Box>
    )
}

export default Encabezado;