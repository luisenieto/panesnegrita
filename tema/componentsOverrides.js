import Card from "./card";
import Paper from './paper';
import IconButton from "./iconButton";
import Button from "./button";
import MenuItem from "./menuItem";
import ListItemIcon from "./listItemIcon";
import Menu from "./menu";
//import Link from "./link";

const ComponentsOverrides = (tema) => {
    return Object.assign(
        Card(tema),
        Paper(tema),        
        Button(tema),        
        Menu(tema),       
    )
}
//MenuItem(tema),
//ListItemIcon(tema),
//IconButton(tema),

export default ComponentsOverrides;