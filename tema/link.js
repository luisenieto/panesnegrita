const Link = (tema) => {
    return {
        MuiLink : {
            styleOverrides: {
                root : {
                    marginLeft : '5px',
                    marginRight : '5px',
                    display : 'block',
                    lineHeight : 1,
                    padding : '8px 12px',
                    marginTop: '6px',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    backgroundColor : tema.palette.primary.main,
                    color : tema.palette.secondary.main,
                    '&:hover' : {
                        textDecoration: 'none',
                        backgroundColor : tema.palette.primary.light,                        
                    },
                    '&:active' : {
                        textDecoration: 'none',
                        backgroundColor : tema.palette.error.light,                        
                    },
                    '&:selected' : {
                        textDecoration: 'none',
                        backgroundColor : tema.palette.error.light,                        
                    }
                }
            }
        }
    }
}

export default Link;