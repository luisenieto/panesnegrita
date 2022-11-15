const Card = (tema) => {
    return {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: tema.shadows[2],
                    borderRadius: Number(tema.shape.borderRadius),
                    position: 'relative',
                    zIndex: 0, // Fix Safari overflow: hidden with border radius                    
                },
            },
        },
        // MuiCardHeader: {
        //     defaultProps: {
        //         titleTypographyProps: { variant: 'h6' },
        //         subheaderTypographyProps: { variant: 'body2' },
        //     },
        //     styleOverrides: {
        //         root: {
        //             padding: tema.spacing(3, 3, 0),
        //         },
        //     },
        // },
        // MuiCardContent: {
        //     styleOverrides: {
        //         root: {
        //             padding: tema.spacing(3),
        //         },
        //     },
        // },
    };
}

export default Card;