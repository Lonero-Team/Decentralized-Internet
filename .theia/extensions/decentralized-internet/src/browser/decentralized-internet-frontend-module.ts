import { ContainerModule } from '@theia/core/shared/inversify';
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import { DecentralizedInternetCommandContribution } from './decentralized-internet-contribution';
import { DecentralizedInternetMenuContribution } from './decentralized-internet-menu';
import { DecentralizedInternetManager } from './decentralized-internet-manager';
import { FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';
import { DecentralizedInternetWidget } from './decentralized-internet-widget';

export default new ContainerModule(bind => {
    // Bind manager
    bind(DecentralizedInternetManager).toSelf().inSingletonScope();
    
    // Bind contributions
    bind(CommandContribution).to(DecentralizedInternetCommandContribution).inSingletonScope();
    bind(MenuContribution).to(DecentralizedInternetMenuContribution).inSingletonScope();
    bind(FrontendApplicationContribution).to(DecentralizedInternetCommandContribution).inSingletonScope();
    
    // Bind widget
    bind(DecentralizedInternetWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: DecentralizedInternetWidget.ID,
        createWidget: () => ctx.container.get(DecentralizedInternetWidget)
    })).inSingletonScope();
});
