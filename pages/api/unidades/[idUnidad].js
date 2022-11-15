import { constantes } from "../../../auxiliares/auxiliaresUnidades";

const handler = async (request, response) => { 
    console.log('DD');   
    response.status(200).json({mensaje : constantes.UNIDAD_CREADA});
}

export default handler;