const MenuItem = (tema) => {
    return {
        MuiMenuItem : {            
            styleOverrides: {
                root : {
                    backgroundColor: tema.palette.primary.main,
                    color : tema.palette.secondary.main,
                    '&:hover' : {
                        backgroundColor: tema.palette.primary.light,                        
                    }
                },

            }
        }        
    }
}

export default MenuItem;