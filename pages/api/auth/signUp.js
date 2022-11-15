import { encriptarClave } from "../../../lib/auth";
import { conectarABaseDeDatos } from "../../../lib/db";

const handler = async (request, response) => {
    if (request.method === 'POST') {
        const { correo, clave} = request.body;

        //validación
        if (!correo || !correo.includes('@') || !clave || clave.trim().length < 6) {
            response.status(422).json({mensaje : 'Datos inválidos'});
            return;
        }

        const cliente = await conectarABaseDeDatos();
        const bd = cliente.db();
        const claveEncriptada = await encriptarClave(clave);
        const resultado = await bd.collection('usuarios').insertOne({
            correo : correo,
            clave : claveEncriptada
        });
        response.status(201).json({mensaje : 'Usuario creado'});
        cliente.close();
    }
}

export default handler;