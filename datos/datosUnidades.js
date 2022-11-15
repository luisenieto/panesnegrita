const unidades = [
    {
        idUnidad : 1,
        nombre : 'Kg',
        equivalencias : [
            {
                idUnidad : 2,
                proporcion : 1000
            },
            {
                idUnidad : 3,
                proporcion : 30
            }
        ]
    },
    {
        idUnidad : 2,
        nombre : 'grs',
        equivalencias : [
            {
                idUnidad : 1,
                proporcion : 0.001
            }
        ]
    },
    {
        idUnidad : 3,
        nombre : 'Cuchara 1/2 TBSP',
        equivalencias : [
            {
                idUnidad : 2,
                proporcion : 100
            },
            {
                idUnidad : 4,
                proporcion : 7.4
            },            
        ]
    },
    {
        idUnidad : 4,
        nombre : 'ml',
        equivalencias : [
            {
                idUnidad : 3,
                proporcion : 0.135
            }            
        ]
    }                            
];

// const unidades = [
//     {
//         idUnidad : 1,
//         nombre : 'grs',
//         equivalencias : []
//     }
// ];

export { unidades };