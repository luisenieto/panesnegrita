//Utilidades para el manejo de la BD
import { MongoClient } from "mongodb";

const conectarABaseDeDatos = async () => {
    const cliente = await MongoClient.connect('mongodb+srv://luisenieto:hwH7KcM7uKFoGyuP@cluster0.ty0xvlr.mongodb.net/panesnegrita?retryWrites=true&w=majority');
    return cliente;
}

export { conectarABaseDeDatos };