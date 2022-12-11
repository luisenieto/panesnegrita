import '../styles/globals.css'
import Proveedor from '../contexto/proveedor';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from "next-auth/react";
import Layout from '../componentes/layout/layout';
import tema1 from '../tema/tema1';

function MyApp({ Component, pageProps }) {
	return (
		<Proveedor>
			<Head>
				<meta name="viewport" content="initial-scale=1, width=device-width" />
			</Head>
			<ThemeProvider theme={tema1}>
				<CssBaseline />
				<SessionProvider sesion = {pageProps.sesion}>
					<Layout>
    					<Component {...pageProps} />
					</Layout>
				</SessionProvider>
			</ThemeProvider>
		</Proveedor>
  	)
}

//El componente que muestra la barra de navegación (Encabezado) usa el hook useSession()
//para determinar si muestra Entrar o Salir según el usuario no esté logueado o sí respectivamente
//A su vez, un componente como el que permite crear una unidad usa getSession() 
//para saber si el usuario está logueado o no mediante getServerSideProps()
//getServerSideProps() devuelve en las props el objeto sesion
//Entonces, si se está logueado, y se está en la página que permite crear una unidad
//y se la actualiza, la página verifica si el usuario está logueado usando getSession()
//y el componente del encabezado también hace la verificación usando useSession()
//Es decir, hay una doble verificación
//Para evitar esto, al componente SessionProvider se le pasa en el atributo sesion (si no funciona, se debe llamar session) el objeto sesion
//De esta forma, para los componentes que hagan la verificación y obtengan en las props la sesión
//se evita hacer la doble verificación
//Si el componente no hace esto, lo hace el componente contenedor (Encabezado en este caso)

export default MyApp
