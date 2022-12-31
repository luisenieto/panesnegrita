import { Avatar, Box, Button, Card, CardActions, CardContent, Divider, Typography } from '@mui/material';

const FotoCliente = () => {
    return (
        <Card>
            <CardContent>
                <Box sx = {{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column'
                    }}
                >
                    <Avatar
                        src = '/avatars/avatar-default.png'
                        sx = {{ height: 64, mb: 2, width: 64 }}
                    />
                    <Typography
                        color = "textPrimary"
                        gutterBottom
                        variant = "h5"
                    >
                        Nombre y Apellido
                    </Typography>                    
                </Box>
            </CardContent>
            <Divider />
            <CardActions>
                <Button
                    color = "primary"
                    fullWidth
                    variant = "text"
                >
                    Subir foto
                </Button>
            </CardActions>
        </Card>
    )
}

export default FotoCliente;