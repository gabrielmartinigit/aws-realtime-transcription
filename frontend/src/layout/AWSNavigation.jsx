import SideNavigation, { SideNavigationItemType } from 'aws-northstar/components/SideNavigation';

const navigationItems = [
    { type: SideNavigationItemType.LINK, text: 'Telemetria', href: '/' },
    { type: SideNavigationItemType.LINK, text: 'Transcrições', href: '/transcricoes' },
    { type: SideNavigationItemType.DIVIDER },
    { type: SideNavigationItemType.LINK, text: 'Arquitetura', href: '/arquitetura' },
    {
        type: SideNavigationItemType.LINK,
        text: 'Repositório',
        href: 'https://github.com/gabrielmartinigit/aws-realtime-transcription',
    }
];

const AWSNavigation = (
    <SideNavigation
        header={{ text: 'Menu', href: '/' }}
        items={navigationItems}
    />
);

export default AWSNavigation;
