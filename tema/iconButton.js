const IconButton = (tema) => {
    return {
        MuiIconButton : {            
            styleOverrides: {
                root : {
                    backgroundColor: tema.palette.primary.main,
                    color : tema.palette.secondary.main,
                    '&:focus' : {
                        backgroundColor: tema.palette.primary.light                            
                    },
                    '&:hover' : {
                        backgroundColor: tema.palette.primary.light,                        
                    }
                },

            }
        }        
    }
}

export default IconButton;