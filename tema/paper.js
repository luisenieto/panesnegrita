const Paper = (tema) => {
    return {
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },            
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: Number(tema.shape.borderRadius),
                },
            },
        },
    };
}

export default Paper;