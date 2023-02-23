const PRIMARY = {
    lighter: '#929089',
    light: '#c3c0b7',
    main: '#f4f0e5',
    dark: '#61605b',
    darker: '#30302d',
    contrastText: '#000000',
};

const SECONDARY = {
    lighter: '#fffff2',
    light: '#f9f9f9',
    main: '#000000',
    dark: '#fbf7f5',
    darker: '#f9f1f1',
    contrastText: '#000000',
};

const ERROR = {
    lighter: '#fe8181',
    light: '#fe5757',    
    main: '#fe2e2e',
    dark: '#cb2424',
    darker: '#b62020',
    contrastText: '#000000',
};

const SUCCESS = {
    lighter: '#aefe57',
    light: '#9afe2e',    
    main: '#8ae429',
    dark: '#6bb120',
    darker: '#4d7f17',
    contrastText: '#000000',
};

const WARNING = {
    lighter: '#fefffc',
    light: '#fbfd9e',
    main: '#f9e909',
    dark: '#fdf25d',
    darker: '#f9e909',
    contrastText: '#ffffff',
};

const TEXTO = {
    main: '#828282',
};

const palette = {
    primary : { ...PRIMARY },
    secondary : { ...SECONDARY },
    error : { ...ERROR },
    success : { ...SUCCESS },
    warning : {...WARNING},
    texto : {...TEXTO}
};

export default palette;