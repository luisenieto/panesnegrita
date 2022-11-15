import { BiLock } from "react-icons/bi";

const Button = (tema) => {
    return {
        MuiButton : {
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
                    textTransform: 'none',
                    fontWeight: 400,
                    fontSize: '1rem',
                    backgroundColor : tema.palette.primary.main,
                    '&:hover' : {
                        textDecoration: 'none',
                        backgroundColor : tema.palette.primary.light,                        
                    }
                }
            }
        }
    }
}

export default Button;