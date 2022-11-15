//import Head from 'next/head'
//import Image from 'next/image'
//import styles from '../styles/Home.module.css'
import path from 'path';
import fs from 'fs/promises';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home(props) {
	const [productos, setProductos] = useState(props.productos);

	// useEffect(() => {
	// 	const prod = [
	// 		{
	// 			"id" : "p1",
	// 			"titulo" : "Producto 1"
	// 		},
	// 		{
	// 			"id" : "p2",
	// 			"titulo" : "Producto 2"
	// 		},
	// 		{
	// 			"id" : "p3",
	// 			"titulo" : "Producto 3"
	// 		},
	// 		{
	// 			"id" : "p4",
	// 			"titulo" : "Producto 4"
	// 		},
	// 		{
	// 			"id" : "p5",
	// 			"titulo" : "Producto 5"
	// 		}												
	// 	];
	// 	setProductos(prod);
	// }, []);

	return (
		<ul>
			{
				productos.map(producto => (
					<li key = {producto.id}><Link href = {`/${producto.id}`}>{producto.titulo}</Link></li>
				))
			}
		</ul>	
  	)	
}

export const getStaticProps = async () => {
	const filePath = path.join(process.cwd(), 'datos', 'productos.json');
	const datosJSON = await fs.readFile(filePath);
	const datos = JSON.parse(datosJSON);

	
	return {
		props : {
			productos : datos.productos
		},
		revalidate : 10,
	}
}
