import fs from 'fs';


// api para el borrado de avatars innecesarios
const handler = async (request, response) => {
    if (request.method === 'POST') {
        const avatars = request.body;        
        if (avatars.length !== 0) {
            for(let i in avatars) {
                fs.unlink('public' + avatars[i], (error) => {
                    if (error) {
                        response.status(200).json({mensaje : 'Error al borrar el avatar ' + 'public' + avatars[i]});
                        return;
                    }     
                });
            } 
            response.status(200).json({mensaje : 'Se borraron los avatars'});          
        }
        else
            response.status(200).json({mensaje : 'No hay avatars para borrar'});
    }
}

export default handler;