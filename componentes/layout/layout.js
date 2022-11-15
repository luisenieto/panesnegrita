import { AppBar, Toolbar, Container, Paper } from "@mui/material";
import Encabezado from "./encabezado/encabezado";
import BarraNavegacion from "./barraNavegacion/barraNavegacion";
import { useState } from 'react';

const Layout = (props) => {
    const [enlaceActivo, setEnlaceActivo] = useState('Home');

    return (
        <Paper sx = {{m: 1}} >
            <AppBar position = 'static'>
                <Container maxWidth = 'xl'> 
                    <Toolbar disableGutters>
                        <Encabezado 
                            enlaceActivo = {enlaceActivo}
                            setEnlaceActivo = {setEnlaceActivo}
                        />
                        <BarraNavegacion 
                            enlaceActivo = {enlaceActivo}
                            setEnlaceActivo = {setEnlaceActivo}
                        />
                    </Toolbar>
                </Container>
            </AppBar>
            <main>
                {props.children}
            </main>
        </Paper>


        // <>
        //     <div>
        //         Layout
        //     </div>
        //     <div>
        //         {props.children}
        //     </div>
        // </>
    )
}

export default Layout;