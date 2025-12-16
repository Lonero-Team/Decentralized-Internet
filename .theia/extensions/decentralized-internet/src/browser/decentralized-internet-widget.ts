import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import * as React from '@theia/core/shared/react';
import { DecentralizedInternetManager, SDKComponent, SDKMetrics } from './decentralized-internet-manager';
import { MessageService } from '@theia/core/lib/browser';

@injectable()
export class DecentralizedInternetWidget extends ReactWidget {
    static readonly ID = 'decentralized-internet:widget';
    static readonly LABEL = 'SDK Dashboard';

    @inject(DecentralizedInternetManager)
    protected readonly manager!: DecentralizedInternetManager;
    
    @inject(MessageService)
    protected readonly messageService!: MessageService;

    private components: SDKComponent[] = [];
    private metrics: SDKMetrics | null = null;

    @postConstruct()
    protected init(): void {
        this.id = DecentralizedInternetWidget.ID;
        this.title.label = DecentralizedInternetWidget.LABEL;
        this.title.caption = DecentralizedInternetWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-cube';

        this.update();
        
        this.manager.onComponentsChange(components => {
            this.components = components;
            this.update();
        });

        this.manager.onMetricsChange(metrics => {
            this.metrics = metrics;
            this.update();
        });
    }

    protected render(): React.ReactNode {
        return (
            <div className='sdk-dashboard' style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
                <h2>Decentralized Internet SDK Dashboard</h2>
                
                {this.renderMetrics()}
                {this.renderComponents()}
            </div>
        );
    }

    private renderMetrics(): React.ReactNode {
        if (!this.metrics) {
            return <div>Loading metrics...</div>;
        }

        return (
            <div style={{ marginBottom: '30px' }}>
                <h3>System Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ padding: '15px', background: '#2d2d2d', borderRadius: '5px' }}>
                        <strong>CPU Usage:</strong> {this.metrics.cpu.toFixed(2)}%
                    </div>
                    <div style={{ padding: '15px', background: '#2d2d2d', borderRadius: '5px' }}>
                        <strong>Memory Usage:</strong> {this.metrics.memory.toFixed(2)}%
                    </div>
                    <div style={{ padding: '15px', background: '#2d2d2d', borderRadius: '5px' }}>
                        <strong>Network RX:</strong> {(this.metrics.network.rx / 1024).toFixed(2)} KB/s
                    </div>
                    <div style={{ padding: '15px', background: '#2d2d2d', borderRadius: '5px' }}>
                        <strong>Network TX:</strong> {(this.metrics.network.tx / 1024).toFixed(2)} KB/s
                    </div>
                </div>
            </div>
        );
    }

    private renderComponents(): React.ReactNode {
        if (this.components.length === 0) {
            return <div>No components found. Make sure the UI Dashboard is running on port 9000.</div>;
        }

        return (
            <div>
                <h3>SDK Components</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #444' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Component</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>PID</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Uptime</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Port</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.components.map(component => this.renderComponentRow(component))}
                    </tbody>
                </table>
            </div>
        );
    }

    private renderComponentRow(component: SDKComponent): React.ReactNode {
        const statusColor = component.status === 'running' ? '#4caf50' : 
                          component.status === 'error' ? '#f44336' : '#999';

        return (
            <tr key={component.name} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '10px' }}>{component.name}</td>
                <td style={{ padding: '10px' }}>
                    <span style={{ 
                        color: statusColor,
                        fontWeight: 'bold'
                    }}>
                        {component.status.toUpperCase()}
                    </span>
                </td>
                <td style={{ padding: '10px' }}>{component.pid || '-'}</td>
                <td style={{ padding: '10px' }}>
                    {component.uptime ? this.formatUptime(component.uptime) : '-'}
                </td>
                <td style={{ padding: '10px' }}>{component.port || '-'}</td>
                <td style={{ padding: '10px' }}>
                    {component.status === 'running' ? (
                        <button 
                            onClick={() => this.handleStop(component.name)}
                            style={{ padding: '5px 10px', cursor: 'pointer' }}
                        >
                            Stop
                        </button>
                    ) : (
                        <button 
                            onClick={() => this.handleStart(component.name)}
                            style={{ padding: '5px 10px', cursor: 'pointer' }}
                        >
                            Start
                        </button>
                    )}
                    <button 
                        onClick={() => this.handleViewLogs(component.name)}
                        style={{ padding: '5px 10px', marginLeft: '5px', cursor: 'pointer' }}
                    >
                        Logs
                    </button>
                </td>
            </tr>
        );
    }

    private formatUptime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}h ${minutes}m ${secs}s`;
    }

    private async handleStart(name: string): Promise<void> {
        try {
            await this.manager.startComponent(name);
            this.messageService.info(`Started ${name}`);
        } catch (error) {
            this.messageService.error(`Failed to start ${name}: ${error}`);
        }
    }

    private async handleStop(name: string): Promise<void> {
        try {
            await this.manager.stopComponent(name);
            this.messageService.info(`Stopped ${name}`);
        } catch (error) {
            this.messageService.error(`Failed to stop ${name}: ${error}`);
        }
    }

    private async handleViewLogs(name: string): Promise<void> {
        try {
            const logs = await this.manager.getComponentLogs(name);
            console.log(`Logs for ${name}:`, logs);
            this.messageService.info(`Check the console for ${name} logs`);
        } catch (error) {
            this.messageService.error(`Failed to get logs for ${name}: ${error}`);
        }
    }
}
