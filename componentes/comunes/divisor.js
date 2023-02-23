import { Divider, Chip, Grid } from '@mui/material';

//Componente que muestra un divisor con una leyenda
const Divisor = ({ leyenda }) => {
    return (
        <Grid item xs = {12}>
            <Divider>
                <Chip label = {leyenda} /> 
            </Divider>
        </Grid>
    )
}

export default Divisor;