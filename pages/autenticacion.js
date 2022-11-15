import { Typography, TextField, Button, Paper, Box, Avatar, Alert } from '@mui/material';
import {FaLock} from 'react-icons/fa';
import { useRef, useState } from 'react';
import axios from "axios";
import { signIn } from 'next-auth/react';
import { useTheme } from '@emotion/react';

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
        throw new Error(datos.mensaje || 'Algo salió mal');
    return datos;
}

const Autenticacion = (props) => {
    const tema = useTheme();
    const correoRef = useRef();
    const claveRef = useRef();
    const [esParaLoguear, setearEsParaLoguear] = useState(true);

    //código a ejecutar cuando se selecciona el botón 
    const btnClic = async () => {
        const correo = correoRef.current.value;
        const clave = claveRef.current.value;        

        //validar los datos

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
                //error: string || undefined: según el tipo de error valdrá dintitos códigos de error
                //status: number: código HTTP de estado
                //ok: boolean: true si el signin fue exitoso
                //url: string || null: null si hubo un error, y si no la url a donde se debería redirigir 
            //console.log(resultado);
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
        // <Paper sx = {{
        //         margin : '1px',
        //         padding : '1px'
        //     }} 
        //     /*className = {classes.pageContent} */ 
        // >
            <Box sx = {{
                    marginTop : '8px',
                    display : 'flex',
                    flexDirection : 'column',
                    alignItems : 'center'
                }}
                /*className = {classes.box_externo} */ 
            >
                <Avatar 
                    sx = {{
                        margin : '5px',
                        backgroundColor : tema.palette.primary.light
                    }}
                    /* className = {classes.avatar} */ 
                >
                    <FaLock /* color = '#3f4771' */ />
                </Avatar>
                <Typography component = 'h1' variant = 'h5'>
                    Acceder
                </Typography>
                <Box 
                    component = 'form' 
                    /* className = {classes.box_interno} */ 
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
                        // inputProps = {{
                        //     onKeyDown : (evento) => {alPresionarTecla(evento)}
                        // }}
                        // onChange = {evento => txtOnChange(evento, 'correo')}
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
                        // inputProps = {{
                        //     onKeyDown : (evento) => {alPresionarTecla(evento)}
                        // }}
                        // onChange = {evento => txtOnChange(evento, 'clave')}
                    />   
                    {/* {                        
                        estadoUsuario.error 
                            ?
                                <Alert severity = 'error'>
                                    {estadoUsuario.error}
                                </Alert>
                            :
                                null
                    } */}
                    <Button /* className = {classes.boton} */
                        fullWidth
                        variant = "contained"
                        onClick = {() => btnClic()}
                        sx = {{
                            marginLeft : '0px',
                            padding : '20px 12px',
                        }}
                    >
                        Acceder
                    </Button>                    
                </Box>
            </Box>
        // </Paper>
    )
}

export default Autenticacion;