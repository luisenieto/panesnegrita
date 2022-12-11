import { encriptarClave } from "../../../lib/auth";
import { conectarBD } from "../unidades/bdAuxiliares";
import { constantes as constantesAutenticacion } from "../../../auxiliares/auxiliaresAutenticacion";
import { constantes as constantesConexion } from "../../../auxiliares/auxiliaresUnidades";

const handler = async (request, response) => {
    if (request.method === 'POST') {
        const { correo, clave} = request.body;

        //validación
        if (!correo || !correo.includes('@') || !clave || clave.trim().length < 6) {
            response.status(422).json({mensaje : constantesAutenticacion.DATOS_INVALIDOS});
            return;
        }

        const resultadoConectarBD = await conectarBD();
        if (resultadoConectarBD.mensaje === constantesConexion.CONEXION_EXITOSA) {
            try {
                const bd = resultadoConectarBD.cliente.db();
                const claveEncriptada = await encriptarClave(clave);
                const resultado = await bd.collection('usuarios').insertOne({
                    correo : correo,
                    clave : claveEncriptada
                });
                response.status(201).json({mensaje : constantesAutenticacion.USUARIO_CREADO});
                resultadoConectarBD.cliente.close();
            }
            catch(error) {
                response.status(201).json({mensaje : constantesAutenticacion.ERROR_CREAR_USUARIO});
            }
        }
        else {
            response.status(201).json({mensaje : resultadoConectarBD.mensaje});
        }        
    }
}

export default handler;