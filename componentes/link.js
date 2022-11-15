import NextLink from "next/link";
//import { Button } from "@mui/material";
import MuiLink from '@mui/material/Link';

const Link = ({ href, children, ...props }) => {    
    return (
        <NextLink href = {href} passHref>
            <MuiLink {...props}>
                {children}
            </MuiLink>
        </NextLink>
    )
}

export default Link;