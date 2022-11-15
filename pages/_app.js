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
				<SessionProvider session = {pageProps.session}>
					<Layout>
    					<Component {...pageProps} />
					</Layout>
				</SessionProvider>
			</ThemeProvider>
		</Proveedor>
  	)
}

export default MyApp
