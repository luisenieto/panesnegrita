import { Grid, Collapse, Alert, AlertTitle } from '@mui/material';
import { useRouter } from 'next/router';

//Componente que muestra un mensaje de error/éxito
const MensajeInformativo = ({mensaje, setMensaje}) => {
    const router = useRouter();
    
    return (
        <Grid item xs = {12}>
            <Collapse in = {mensaje.mostrar}>
                <Alert 
                    severity = {mensaje.gravedad} 
                    onClose = {() => {
                        if (mensaje.gravedad === 'success')
                            router.push('/unidades');  
                        setMensaje({...mensaje, mostrar : false});
                    }}
                >
                    <AlertTitle>{mensaje.titulo}</AlertTitle>
                    {mensaje.texto}
                </Alert>
            </Collapse>
        </Grid>
    )
}

export default MensajeInformativo;