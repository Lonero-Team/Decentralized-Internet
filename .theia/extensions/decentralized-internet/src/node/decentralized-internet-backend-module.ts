import { ContainerModule } from '@theia/core/shared/inversify';

export default new ContainerModule(() => {
    // Backend module - currently no backend-specific services needed
    // All SDK communication goes through the UI Dashboard REST API
});
