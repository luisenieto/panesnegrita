import { Grid, Avatar, Button, Card, Box, CardMedia, CardContent, Typography } from '@mui/material';
import Image from 'next/image';
import { useTheme } from '@emotion/react';
import { constantes } from '../../auxiliares/auxiliaresIngredientes';

const Foto = () => {
    const tema = useTheme();

    return (
        <Grid item lg = {12} sm = {12} xs = {12}>
            <Card sx = {{ display: 'flex' }}>
                <Box 
                    sx = {{ display: 'flex', flex: '1 1 230px' }}
                    alignItems = "center"
                >                                        
                    {/* flexDirection: 'column' en sx
                        <CardContent sx={{ flex: '1 2 auto' }}>
                        <Typography component="div" variant="h5">
                            Foto del ingrediente
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" component="div">
                            Mac Miller
                        </Typography>
                    </CardContent> */}
                    {/* <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}> */}
                        <Button 
                            sx = {{color : tema.palette.secondary.main}}
                        >
                            Subir foto del ingrediente
                        </Button>
                    {/*</Box> */}
                </Box>
                <Image 
                    src = {constantes.SIN_IMAGEN}
                    alt = "Live from space album cover"
                    width = {300}
                    height = {150}
                    priority
                />
                {/* <CardMedia
                    component = "img"
                    sx={{ width : 300, height : 200 }}
                    image = "/subidas/1669816329333-Screenshot_20220809-180941_WhatsApp.jpg"
                    alt = "Live from space album cover"                    
                /> */}
            </Card>





            {/* <Grid container spacing = {2}>
                <Grid item lg = {6} sm = {6} xs = {6}>
                    <Button>
                        Subir
                    </Button>
                </Grid>
                <Grid item lg = {6} sm = {6} xs = {6}>  
                    <Card>
                        <Box >
                            <Image 
                                src = '/subidas/1669810495478-Screenshot_20220809-180941_WhatsApp.jpg' 
                                alt = 'descripcion'
                                top = {0}
                                width = '100%'
                                height = '100%'
                                position = 'absolute'
                                objectFit = 'cover'
                            /> 
                        </Box>   
                    </Card>                                  
                </Grid>
            </Grid> */}
        </Grid>
    )
}

export default Foto;