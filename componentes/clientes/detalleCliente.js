import { IconButton, Avatar, Typography, Box, Button, Card, CardContent, CardHeader, Divider, Grid, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import { MuiTelInput } from 'mui-tel-input';
import { useState } from 'react';


import { constantes} from '../../auxiliares/auxiliaresClientes';

const DetalleCliente = () => {
    const [value, setValue] = useState('');
    const handleChange = (newValue) => {
        setValue(newValue)
    }

    return (
        <Card>
            {/* <CardHeader   
                avatar = {
                    <Avatar
                        src = '/avatars/avatar-default.png'
                    />
                }              
                subheader="The information can be edited"                
                title="Profile"
            />
            <Divider /> */}
            <CardContent>
                <Grid container spacing = {2}>
                    <Grid item md = {12} xs = {12}>
                        <IconButton aria-label="upload picture" component="label">
                            <img src = '/avatars/avatar-default.png' alt = 'zz' height = {64} width = {64}/>
                            <input hidden accept = 'image/*' multiple type = 'file' onChange = {() => {}} />
                        </IconButton>
                    </Grid>
                    <Grid item md = {6} xs = {12} >
                        <TextField
                            fullWidth
                            // helperText="Please specify the first name"
                            label = {constantes.NOMBRE}
                            name = {constantes.NOMBRE}
                            // onChange={handleChange}
                            required
                            // value={values.firstName}
                            variant = "outlined"
                        />
                    </Grid>
                    <Grid item md = {6} xs = {12} >
                        <TextField
                            fullWidth
                            label = {constantes.APELLIDO}
                            name = {constantes.APELLIDO}
                            // onChange={handleChange}
                            // value={values.lastName}
                            variant = "outlined"
                        />
                    </Grid>
                    <Grid item md = {6} xs = {12} >
                        <TextField
                            fullWidth
                            label = {constantes.REFERENCIA}
                            name = {constantes.REFERENCIA}
                            // onChange={handleChange}
                            required
                            // value={values.email}
                            variant = "outlined"
                        />
                    </Grid>
                    <Grid item md = {6} xs = {12} >
                    <MuiTelInput 
                        fullWidth
                        label = {constantes.TELEFONO}
                        name = {constantes.TELEFONO}
                        onChange = {handleChange}
                        value = {value}
                    />
                    </Grid>
                    <Grid item md = {6} xs = {12} >
                        <TextField
                            fullWidth
                            label = {constantes.CORREO}
                            name = {constantes.CORREO}
                            type = 'email'
                            // onChange={handleChange}
                            // value={values.email}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item md = {6} xs = {12} >
                        <LocalizationProvider dateAdapter = {AdapterDayjs} adapterLocale = 'es'>
                            <DesktopDatePicker
                                label = {constantes.FECHA_NACIMIENTO}
                                inputFormat = "DD/MM/YYYY"
                                // value={value}                                
                                onChange = {() => {}}
                                renderInput = {(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

//Para validar algunos campos: https://dev.to/hibaeldursi/creating-a-contact-form-with-validation-with-react-and-material-ui-1am0

export default DetalleCliente;