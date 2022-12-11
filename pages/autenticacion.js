import { Typography, TextField, Button, Box, Avatar, Collapse, Alert, AlertTitle } from '@mui/material';
import {FaLock} from 'react-icons/fa';
import { useRef, useState, useEffect, useContext } from 'react';
import axios from "axios";
import { signIn } from 'next-auth/react';
import { useTheme } from '@emotion/react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { constantes } from '../auxiliares/auxiliaresAutenticacion';
import { ProveedorContexto } from '../contexto/proveedor';

//crea un usuario en la BD
//si a esta función se la implementa en el mismo archivo donde están las utilidades
//para el manejo de la BD (lib/db) sale un error al querer importarla
//creo que es porque en el mismo archivo habría código que se ejecuta en el servidor (conectarABaseDeDatos)
// y en el cliente (crearUsuario)
//si a la función crearUsuario() se la implementa en un archivo separado
//no da error la importación
const crearUsuario = async (correo, clave) => {    

    const respuesta = await axios.post('/api/auth/signUp', {
        correo : correo, 
        clave : clave
    });

    const datos = respuesta.data;
    if (respuesta.status !== 201)
        throw new Error(datos.mensaje || constantes.ERROR_CREAR_USUARIO);
    return datos;
}

const Autenticacion = (props) => {
    const router = useRouter();
    const tema = useTheme();
    const correoRef = useRef();
    const claveRef = useRef();
    const [esParaLoguear, setearEsParaLoguear] = useState(true);
    const { redirigirA } = useContext(ProveedorContexto);

    const [mensaje, setMensaje] = useState({
        titulo : '',
        texto : '',
        mostrar : false
    });
    //controla la alerta

    //si se está logueado y se escribe en el browser la dirección del formulario, se redirige a la página de donde vino
    useEffect(() => {
        getSession().then(sesion => {
            if (sesion)
                router.back();
        })        
    }, [router]); //eslint-disable-line react-hooks/exhaustive-deps 
    //el comentario anterior es para que en la consola no aparezca el warning diciendo que el array de depdencias de useEffect está vacío

    //código a ejecutar cuando se selecciona el botón Acceder
    const handleAcceder = async () => {
        const correo = correoRef.current.value;
        const clave = claveRef.current.value;        

        //validación
        if (!correo) {
            setMensaje({
                titulo : constantes.TITULO_APLICACION,
                texto : constantes.CORREO_EN_BLANCO,
                mostrar : true
            });
            return;
        }
        
        if (!correo.includes('@')) {
            setMensaje({
                titulo : constantes.TITULO_APLICACION,
                texto : constantes.CORREO_INVALIDO,
                mostrar : true
            });
            return;
        }

        if (!clave) {
            setMensaje({
                titulo : constantes.TITULO_APLICACION,
                texto : constantes.CLAVE_EN_BLANCO,
                mostrar : true
            });
            return;
        }

        if (clave.trim().length < 6) {
            setMensaje({
                titulo : constantes.TITULO_APLICACION,
                texto : constantes.LONGITUD_CLAVE_INCORRECTA,
                mostrar : true
            });
            return;
        }

        if (esParaLoguear) {
            //No hay necesidad de armar el pedido (no se debe)
            //En su lugar se usa sigIn()
            const resultado = await signIn('credentials', {
                redirect : false,
                correo : correo,
                clave : clave
            });
            //siempre se obtiene un valor para resultado, incluso si hay un error
            //el primer argumento de signIn() describe el provider (se pueden tener varios)
            //como se están usando credenciales propias, se especifica 'credentials'
            //el segundo argumento es lo que se pasa a la función authorize()
            //parámetro credenciales en este caso
            //redirect : false -> para no redirigir en caso de tirar un error
            //resultado es un objeto con las siguientes claves:
                //error: string || undefined: según el tipo de error 
                //status: number: código HTTP de estado
                //ok: boolean: true si el signin fue exitoso
                //url: string || null: null si hubo un error, y si no la url a donde se debería redirigir 
            if (!resultado.error) { //después que el usuario se loguea se lo redirecciona a otra página
                //después de loguearse, se redirige a la ruta desde la que vino
                router.replace(redirigirA);
                //router.back();
            }
            else { //si hay algún error con los datos, se muestra un aviso
                setMensaje({
                    titulo : constantes.TITULO_APLICACION,
                    texto : resultado.error,
                    mostrar : true
                });
            }
        }
        else { //para crear un usuario
            try {
                const resultado = await crearUsuario(correo, clave);
                console.log(resultado);
            }
            catch(error) {
                console.log(error);
            }
        }
    }

    return (
        <Box sx = {{
                marginTop : '8px',
                display : 'flex',
                flexDirection : 'column',
                alignItems : 'center'
            }}
        >
            <Avatar 
                sx = {{
                    margin : '5px',
                    backgroundColor : tema.palette.primary.light
                }}
            >
                <FaLock /* color = '#3f4771' */ />
            </Avatar>
            <Typography component = 'h1' variant = 'h5'>
                Acceder
            </Typography>
            <Box 
                component = 'form' 
                sx = {{
                    
                    flexDirection : 'column',
                    alignItems : 'center'
                }}
            >
                <TextField
                    inputRef = {correoRef}
                    margin = "normal"                         
                    required
                    fullWidth
                    id = "correo"
                    label = "Correo"
                    name = "correo"
                    autoComplete = "correo"
                    autoFocus
                />
                <TextField
                    inputRef = {claveRef}
                    margin = "normal"                            
                    required
                    fullWidth
                    name = "clave"
                    label = "Clave"
                    type = "password"
                    id = "clave"
                    autoComplete = "current-password"
                />  
                <Collapse in = {mensaje.mostrar}>
                    <Alert
                        severity = 'error'
                        onClose = { () => setMensaje({...mensaje, mostrar : false}) }
                    >
                        <AlertTitle>{mensaje.titulo}</AlertTitle>
                        {mensaje.texto}
                    </Alert>
                </Collapse>
                <Button 
                    fullWidth
                    variant = "contained"
                    onClick = { handleAcceder }
                    sx = {{
                        marginLeft : '0px',
                        padding : '20px 12px',
                    }}
                >
                    Acceder
                </Button>                    
            </Box>
        </Box>
    )
}

export default Autenticacion;