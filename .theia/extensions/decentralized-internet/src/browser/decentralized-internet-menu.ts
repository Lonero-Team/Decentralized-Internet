import { injectable } from '@theia/core/shared/inversify';
import { MenuContribution, MenuModelRegistry } from '@theia/core/lib/common';
import { CommonMenus } from '@theia/core/lib/browser';
import { DecentralizedInternetCommands } from './decentralized-internet-contribution';

@injectable()
export class DecentralizedInternetMenuContribution implements MenuContribution {
    
    registerMenus(menus: MenuModelRegistry): void {
        // Add to View menu
        menus.registerMenuAction(CommonMenus.VIEW, {
            commandId: DecentralizedInternetCommands.OPEN_DASHBOARD.id,
            label: 'SDK Dashboard',
            order: '0'
        });

        // Create SDK submenu
        const SDK_MENU = [...CommonMenus.VIEW, '2_sdk'];
        
        menus.registerSubmenu(SDK_MENU, 'Decentralized Internet', {
            order: '1'
        });

        menus.registerMenuAction(SDK_MENU, {
            commandId: DecentralizedInternetCommands.START_COMPONENT.id,
            label: 'Start Component',
            order: '1'
        });

        menus.registerMenuAction(SDK_MENU, {
            commandId: DecentralizedInternetCommands.STOP_COMPONENT.id,
            label: 'Stop Component',
            order: '2'
        });

        menus.registerMenuAction(SDK_MENU, {
            commandId: DecentralizedInternetCommands.NEW_TEMPLATE.id,
            label: 'New Template',
            order: '3'
        });

        menus.registerMenuAction(SDK_MENU, {
            commandId: DecentralizedInternetCommands.VIEW_LOGS.id,
            label: 'View Logs',
            order: '4'
        });
    }
}
