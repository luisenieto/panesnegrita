import path from 'path';
import fs from 'fs/promises';

const DetalleProducto = (props) => {
    const producto = props.productoCargado;

    if (!producto)
        return <p>Cargando...</p>

    return (
        <>
            <h1>{producto.titulo}</h1>
            <p>{producto.descripcion}</p>
        </>
    )
}

const obtenerDatos = async () => {
    const filePath = path.join(process.cwd(), 'datos', 'productos.json');
	const datosJSON = await fs.readFile(filePath);
	const datos = JSON.parse(datosJSON);
    return datos;
}
//como obtenerDatos es async se puede usar await adentro

export const getStaticProps = async (contexto) => {
    const { params } = contexto;
    const productoId = params.productoId;

	const datos = await obtenerDatos(); 
    const producto = datos.productos.find(producto => producto.id === productoId);

	return {
		props : {
			productoCargado : producto
		}
	}
}

export const getStaticPaths = async () => {
    const datos = await obtenerDatos();
    const ids = datos.productos.map(producto => producto.id);
    const paramsId = ids.map(id => ({params : {productoId : id }}));
    return {
        paths : paramsId,
        fallback : true
    }
}

export default DetalleProducto;