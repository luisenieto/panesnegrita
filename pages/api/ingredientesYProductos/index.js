import { obtenerIngredientesYProductos } from "./bdAuxiliares";


//api para el manejo de ingredientes y productos
//sirve para cuando se está definiendo un producto nuevo, cuyos ingredientes pueder ser
//ingredientes propiamente dicho, u otros productos
const handler = async (request, response) => {
    //if (request.method === 'GET') {
        const resultadoObtenerIngredientesYProductos = await obtenerIngredientesYProductos();
        response.status(200).json({...resultadoObtenerIngredientesYProductos});
        return;
    //}
}

export default handler;