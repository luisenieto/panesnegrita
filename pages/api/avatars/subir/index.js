import multer from "multer";
import path from 'path';
import nextConnect from "next-connect";

//api para el manejo de la subida de archivos (avatars)

//Multer es un middleware de Node para manejar datos multipart/form 
//usado principalmente para subir archivos
const cargar = multer({    
    storage : multer.diskStorage({
        destination : function(request, archivo, callback) {
            callback(null, path.join(process.cwd(), "public", "avatars"))
        },
        filename : (request, archivo, callback) => {
            callback(null, new Date().getTime() + "-" + archivo.originalname)
        }
    })
});

//next-connect es un router y un middleware para servidores HTTP Next.js, Micro, o Node.js 
const handler = nextConnect({
    onError : (error, request, response) => {
        response.status(500).json({mensaje : 'Algo se rompió'}); 
    },
    onNoMatch : (request, response) => {
        response.status(404).json({mensaje : 'Página no encontrada'}); 
    }
});

handler.use(cargar.array('imagen')); // atributo mediante el cual se envía el archivo

handler.post((request, response) => {
    //response.status(201).json({body : request.body, archivo : request.files[0]}); 
    response.status(201).json({archivo : request.files[0].path}); 
    //request.files[0].path es la ruta completa donde del archivo subido, por ejemplo:
    ///var/www/html/panesnegrita/public/avatars/1672186064380-8.jpg
    //luego, en el frontend se extrae la última parte (/avatars/1672186064380-8.jpg)
    //y eso es lo que se guarda en el atributo foto
});

export default handler;

export const config = {
    api: {
        bodyParser: false, // se deshabilita al parsing del cuerpo, se consume como stream
    },
};

