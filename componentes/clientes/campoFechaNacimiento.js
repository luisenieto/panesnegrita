import { Grid, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';
import 'dayjs/locale/es';


//Componente que muestra el campo de texto (fecha de nacimiento) para crear/modificar un cliente
const CampoFechaNacimiento = ({leyenda, cliente, setCliente, mostrar}) => {
    const [valorFecha, setValorFecha] = useState(cliente.fechaNacimiento);
    //controla el componente DesktopDatePicker

    const handleChange = (valor) => {
        setValorFecha(valor);
        try {
            //valor.$d es una cadena de la forma: Fri Feb 01 0002 00:00:00 GMT-0420 (hora estándar de Argentina)
            const fecha = valor.$d.toISOString();
            //fecha es una cadena de la forma: 0002-02-01T04:20:52.000Z

            const anio = parseInt(fecha.substring(0, 4));

            if (anio >= 1000) //anio de 4 dígitos
                setCliente({...cliente, 'fechaNacimiento' : fecha});
                //sólo cuando la fecha tiene 4 dígitos para el año se la guarda
            else
                setCliente({...cliente, 'fechaNacimiento' : null});
        }
        catch(error) {
            setCliente({...cliente, 'fechaNacimiento' : null});
            //si la fecha está mal formada, no se la guarda
        }
    }

    return (
        <Grid item lg = {6} sm = {12} xs = {12}>
            <LocalizationProvider dateAdapter = {AdapterDayjs} adapterLocale = 'es'>
                <DesktopDatePicker
                    id = {leyenda}
                    name = {leyenda}
                    label = {leyenda}
                    inputFormat = "DD/MM/YYYY"                          
                    value = {valorFecha}       
                    onChange = {handleChange}
                    renderInput = {(params) => <TextField {...params} fullWidth />}
                />
            </LocalizationProvider>
        </Grid>
    )
}

export default CampoFechaNacimiento;