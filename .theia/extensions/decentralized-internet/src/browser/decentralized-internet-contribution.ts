import { inject, injectable } from '@theia/core/shared/inversify';
import { Command, CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import { FrontendApplicationContribution, WidgetManager, MessageService } from '@theia/core/lib/browser';
import { DecentralizedInternetManager } from './decentralized-internet-manager';
import { DecentralizedInternetWidget } from './decentralized-internet-widget';

export const DecentralizedInternetCommands = {
    OPEN_DASHBOARD: Command.toLocalizedCommand({
        id: 'decentralizedInternet.openDashboard',
        label: 'Open SDK Dashboard'
    }, 'decentralizedInternet'),
    START_COMPONENT: Command.toLocalizedCommand({
        id: 'decentralizedInternet.startComponent',
        label: 'Start SDK Component'
    }, 'decentralizedInternet'),
    STOP_COMPONENT: Command.toLocalizedCommand({
        id: 'decentralizedInternet.stopComponent',
        label: 'Stop SDK Component'
    }, 'decentralizedInternet'),
    NEW_TEMPLATE: Command.toLocalizedCommand({
        id: 'decentralizedInternet.newTemplate',
        label: 'New SDK Template'
    }, 'decentralizedInternet'),
    TERMINAL: Command.toLocalizedCommand({
        id: 'decentralizedInternet.terminal',
        label: 'SDK Terminal'
    }, 'decentralizedInternet'),
    VIEW_LOGS: Command.toLocalizedCommand({
        id: 'decentralizedInternet.viewLogs',
        label: 'View Component Logs'
    }, 'decentralizedInternet')
};

@injectable()
export class DecentralizedInternetCommandContribution implements CommandContribution, FrontendApplicationContribution {
    
    @inject(DecentralizedInternetManager)
    protected readonly manager: DecentralizedInternetManager;
    
    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;
    
    @inject(MessageService)
    protected readonly messageService: MessageService;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(DecentralizedInternetCommands.OPEN_DASHBOARD, {
            execute: () => this.openDashboard()
        });

        commands.registerCommand(DecentralizedInternetCommands.START_COMPONENT, {
            execute: async () => {
                const component = await this.messageService.showInputMessage('Enter component name (decentg, clusterpost, gridbee, lnrchain):', '');
                if (component) {
                    try {
                        await this.manager.startComponent(component);
                        this.messageService.info(`Started ${component}`);
                    } catch (error) {
                        this.messageService.error(`Failed to start ${component}: ${error}`);
                    }
                }
            }
        });

        commands.registerCommand(DecentralizedInternetCommands.STOP_COMPONENT, {
            execute: async () => {
                const component = await this.messageService.showInputMessage('Enter component name:', '');
                if (component) {
                    try {
                        await this.manager.stopComponent(component);
                        this.messageService.info(`Stopped ${component}`);
                    } catch (error) {
                        this.messageService.error(`Failed to stop ${component}: ${error}`);
                    }
                }
            }
        });

        commands.registerCommand(DecentralizedInternetCommands.NEW_TEMPLATE, {
            execute: async () => {
                const templates = [
                    'Mesh Network Component',
                    '5G Core Handler',
                    'Blockchain Smart Contract',
                    'P2P Communication Module',
                    'Distributed Computing Task'
                ];
                
                const template = await this.messageService.showQuickPick(templates, {
                    placeholder: 'Select template type'
                });
                
                if (template) {
                    this.messageService.info(`Creating ${template} template...`);
                    // Template creation logic would go here
                }
            }
        });

        commands.registerCommand(DecentralizedInternetCommands.VIEW_LOGS, {
            execute: async () => {
                const component = await this.messageService.showInputMessage('Enter component name:', '');
                if (component) {
                    const logs = await this.manager.getComponentLogs(component);
                    console.log(`Logs for ${component}:`, logs);
                    this.messageService.info(`Check console for ${component} logs`);
                }
            }
        });
    }

    async onStart(): Promise<void> {
        console.log('Decentralized Internet Extension started');
    }

    private async openDashboard(): Promise<void> {
        const widget = await this.widgetManager.getOrCreateWidget(DecentralizedInternetWidget.ID);
        widget.title.label = 'SDK Dashboard';
        widget.title.caption = 'Decentralized Internet SDK Dashboard';
        widget.title.closable = true;
        
        if (!widget.isAttached) {
            await this.widgetManager.openWidget(DecentralizedInternetWidget.ID, {
                area: 'main'
            });
        }
    }
}
