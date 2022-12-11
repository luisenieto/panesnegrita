import NextAuth from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
//import Providers from 'next-auth/providers';
import { conectarBD } from "../unidades/bdAuxiliares";
import { verificarClave } from "../../../lib/auth";
import { constantes } from "../../../auxiliares/auxiliaresAutenticacion";

//al exportala se la está ejecutando
//cuando se la ejecuta devuelve una función handler, la cual es creada por NextAuth
//cuando se llama a NextAuth() se le puede pasar un objeto para configurar
// el comportamiento de NextAuth
export default NextAuth({
    providers : [
        CredentialProvider({
            session : {
                strategy : "jwt" //indica que se usen JWT (se usa cuando se usan credenciales propias)
            },
            async authorize(credenciales) {
                const resultadoConectarBD = await conectarBD();
                const coleccionUsuarios = resultadoConectarBD.cliente.db().collection('usuarios');
                const usuario = await coleccionUsuarios.findOne({correo : credenciales.correo});
                if (!usuario) { //no se encontró el usuario especificado
                    resultadoConectarBD.cliente.close();
                    throw new Error(constantes.USUARIO_NO_ENCONTRADO);
                    //cuando se tira un error, NextAuth redirige automáticamente a otra ruta
                    //este comportamiento se puede redefinir
                }

                //si se encontró el usuario, se debe verificar 
                //que la clave especificada coincida con la que está guardada
                const esUsuarioValido = await verificarClave(credenciales.clave, usuario.clave);
                if (!esUsuarioValido) {
                    resultadoConectarBD.cliente.close();
                    throw new Error(constantes.CLAVE_NO_COINCIDE);                
                }

                resultadoConectarBD.cliente.close(); 
                //si se llega hasta aquí es porque existe el usuario
                //y la clave especificada coincide con la que está guardada

                return {correo : usuario.correo};
                //se debe devolver un objeto, el cual se incluye en el JWT, por lo que
                //no se recomienda exponer la clave
            } //authorize
        }) //CredentialProvider
    ] //providers
}); //NextAuth() 

