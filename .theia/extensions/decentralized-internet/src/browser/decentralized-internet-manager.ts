import { injectable } from '@theia/core/shared/inversify';
import * as io from 'socket.io-client';

export interface SDKComponent {
    name: string;
    status: 'running' | 'stopped' | 'error';
    pid?: number;
    uptime?: number;
    port?: number;
}

export interface SDKMetrics {
    cpu: number;
    memory: number;
    network: {
        rx: number;
        tx: number;
    };
    components: {
        [key: string]: {
            cpu: number;
            memory: number;
        };
    };
}

@injectable()
export class DecentralizedInternetManager {
    private socket: any;
    private components: Map<string, SDKComponent> = new Map();
    private listeners: Set<(components: SDKComponent[]) => void> = new Set();
    private metricsListeners: Set<(metrics: SDKMetrics) => void> = new Set();

    constructor() {
        this.connectToBackend();
    }

    private connectToBackend(): void {
        // Connect to UI Dashboard backend
        this.socket = io('http://localhost:9000', {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity
        });

        this.socket.on('connect', () => {
            console.log('Connected to Decentralized Internet backend');
            this.loadComponents();
        });

        this.socket.on('componentStatus', (data: { component: string; status: SDKComponent }) => {
            this.components.set(data.component, data.status);
            this.notifyListeners();
        });

        this.socket.on('metrics', (metrics: SDKMetrics) => {
            this.notifyMetricsListeners(metrics);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from Decentralized Internet backend');
        });
    }

    async loadComponents(): Promise<void> {
        try {
            const response = await fetch('http://localhost:9000/api/status');
            const data = await response.json();
            
            if (data.components) {
                Object.entries(data.components).forEach(([name, status]) => {
                    this.components.set(name, status as SDKComponent);
                });
                this.notifyListeners();
            }
        } catch (error) {
            console.error('Failed to load components:', error);
        }
    }

    async startComponent(name: string): Promise<void> {
        try {
            const response = await fetch(`http://localhost:9000/api/start/${name}`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                console.log(`Started ${name}`);
            } else {
                throw new Error(data.error || 'Failed to start component');
            }
        } catch (error) {
            console.error(`Failed to start ${name}:`, error);
            throw error;
        }
    }

    async stopComponent(name: string): Promise<void> {
        try {
            const response = await fetch(`http://localhost:9000/api/stop/${name}`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                console.log(`Stopped ${name}`);
            } else {
                throw new Error(data.error || 'Failed to stop component');
            }
        } catch (error) {
            console.error(`Failed to stop ${name}:`, error);
            throw error;
        }
    }

    async getComponentLogs(name: string): Promise<string[]> {
        try {
            const response = await fetch(`http://localhost:9000/api/logs/${name}`);
            const data = await response.json();
            return data.logs || [];
        } catch (error) {
            console.error(`Failed to get logs for ${name}:`, error);
            return [];
        }
    }

    getComponents(): SDKComponent[] {
        return Array.from(this.components.values());
    }

    getComponent(name: string): SDKComponent | undefined {
        return this.components.get(name);
    }

    onComponentsChange(listener: (components: SDKComponent[]) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    onMetricsChange(listener: (metrics: SDKMetrics) => void): () => void {
        this.metricsListeners.add(listener);
        return () => this.metricsListeners.delete(listener);
    }

    private notifyListeners(): void {
        const components = this.getComponents();
        this.listeners.forEach(listener => listener(components));
    }

    private notifyMetricsListeners(metrics: SDKMetrics): void {
        this.metricsListeners.forEach(listener => listener(metrics));
    }

    dispose(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
        this.listeners.clear();
        this.metricsListeners.clear();
    }
}
