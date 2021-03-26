// Applying the themes
import NorthStarThemeProvider from 'aws-northstar/components/NorthStarThemeProvider';
// Building the layout
import AppLayout from 'aws-northstar/layouts/AppLayout';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
// Content pages rendered in the central panel
import Telemetry from './content/Telemetry';
import Architecture from './content/Architecture';
import Transcription from './content/Transcription';
import AWSHeader from './layout/AWSHeader';
import AWSNavigation from './layout/AWSNavigation';
import ThemeOverride from './layout/ThemeOverride';


ReactDOM.render(
    <BrowserRouter>
        <NorthStarThemeProvider theme={ThemeOverride}>
            <AppLayout
                header={AWSHeader}
                navigation={AWSNavigation}>
                <Switch>
                    <Route path="/" exact={true} component={Telemetry} />
                    <Route path="/arquitetura" exact={true} component={Architecture} />
                    <Route path="/transcricoes" exact={true} component={Transcription} />
                    <Route path="*" exact={true} component={Telemetry} />
                </Switch>
            </AppLayout>
        </NorthStarThemeProvider >
    </BrowserRouter>,
    document.getElementById('root')
);
