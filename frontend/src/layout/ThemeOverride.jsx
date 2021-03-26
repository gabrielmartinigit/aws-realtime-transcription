import { getTheme } from 'aws-northstar/themes/default';


// Make here your theme overrides here
let ThemeOverride = getTheme();
ThemeOverride.typography.fontFamily = 'amazon_ember_regular';
ThemeOverride.palette.primary.main = '#232f3e'; //squid-ink

export default ThemeOverride;
