# DecentG Deployment Guide

## Prerequisites

Before deploying DecentG, ensure you have:

1. **Node.js** (version 14.0.0 or higher)
2. **NPM** (comes with Node.js)
3. **Open5gs** or **Free5gc** (optional, for 5G functionality)
4. Network connectivity between nodes
5. Open ports for mesh communication

## Installation

### 1. Install Dependencies

```bash
cd decentg
npm install
```

### 2. Configure the Node

Edit `config.json` to match your environment:

```json
{
  "network": {
    "meshPort": 8000,
    "apiPort": 3000,
    "networkId": "your-network-id",
    "host": "0.0.0.0"
  },
  "open5gs": {
    "enabled": true,
    "amfHost": "your-amf-host",
    "amfPort": 38412
  }
}
```

### 3. Start the Node

**Development mode:**
```bash
npm start
```

**Production mode (with PM2):**
```bash
npm run prod
```

## Open5gs Setup

### Installation

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository ppa:open5gs/latest
sudo apt update
sudo apt install open5gs
```

#### Docker:
```bash
docker pull open5gs/open5gs
docker run -d --name open5gs -p 38412:38412 open5gs/open5gs
```

### Configuration

1. Edit Open5gs configuration files in `/etc/open5gs/`
2. Configure AMF, SMF, and UPF addresses to match your `config.json`
3. Restart Open5gs services:

```bash
sudo systemctl restart open5gs-amfd
sudo systemctl restart open5gs-smfd
sudo systemctl restart open5gs-upfd
```

## Free5gc Setup

### Installation

```bash
git clone https://github.com/free5gc/free5gc.git
cd free5gc
make
```

### Configuration

1. Edit `config/amfcfg.yaml`, `config/smfcfg.yaml`
2. Set the AMF address in DecentG's `config.json`
3. Start Free5gc:

```bash
./run.sh
```

## Firewall Configuration

### Open Required Ports

```bash
# Mesh communication
sudo ufw allow 8000/tcp
sudo ufw allow 8001/udp

# API server
sudo ufw allow 3000/tcp

# Multicast for discovery
sudo ufw allow 9999/udp

# 5G Core (if using)
sudo ufw allow 38412/sctp
sudo ufw allow 2152/udp
```

## Multi-Node Deployment

### Node 1 (Primary):

```json
{
  "network": {
    "meshPort": 8000,
    "apiPort": 3000,
    "networkId": "decentg-prod",
    "host": "0.0.0.0"
  }
}
```

Start:
```bash
NODE_ENV=production pm2 start index.js --name decentg-node1
```

### Node 2 (Secondary):

```json
{
  "network": {
    "meshPort": 8000,
    "apiPort": 3000,
    "networkId": "decentg-prod",
    "host": "0.0.0.0"
  }
}
```

Start:
```bash
NODE_ENV=production pm2 start index.js --name decentg-node2
```

### Connect Nodes

On Node 2:
```bash
curl -X POST http://localhost:3000/api/peer/connect \
  -H "Content-Type: application/json" \
  -d '{"address": "node1-ip", "port": 8000}'
```

## Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8000 8001 3000 9999

CMD ["node", "index.js"]
```

### Build and Run

```bash
docker build -t decentg-mesh .
docker run -d \
  --name decentg-node \
  -p 8000:8000 \
  -p 8001:8001/udp \
  -p 3000:3000 \
  -p 9999:9999/udp \
  -v $(pwd)/config.json:/app/config.json \
  decentg-mesh
```

## Kubernetes Deployment

### Create Deployment

`decentg-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: decentg-mesh
spec:
  replicas: 3
  selector:
    matchLabels:
      app: decentg
  template:
    metadata:
      labels:
        app: decentg
    spec:
      containers:
      - name: decentg
        image: decentg-mesh:latest
        ports:
        - containerPort: 8000
          name: mesh
        - containerPort: 3000
          name: api
        - containerPort: 9999
          name: discovery
          protocol: UDP
        volumeMounts:
        - name: config
          mountPath: /app/config.json
          subPath: config.json
      volumes:
      - name: config
        configMap:
          name: decentg-config
```

Deploy:
```bash
kubectl apply -f decentg-deployment.yaml
```

## Monitoring

### Check Node Status

```bash
curl http://localhost:3000/api/status
```

### View Logs

**PM2:**
```bash
pm2 logs decentg-node
```

**Docker:**
```bash
docker logs -f decentg-node
```

### Monitor Peers

```bash
curl http://localhost:3000/api/peers
```

## Troubleshooting

### Node Won't Start

1. Check if ports are available:
```bash
netstat -tulpn | grep -E '(8000|3000)'
```

2. Verify Node.js version:
```bash
node --version  # Should be >= 14.0.0
```

### Peers Not Connecting

1. Check firewall rules
2. Verify network ID matches across nodes
3. Check discovery is working:
```bash
tcpdump -i any udp port 9999
```

### 5G Core Connection Issues

1. Verify Open5gs/Free5gc is running:
```bash
sudo systemctl status open5gs-amfd
```

2. Check connectivity:
```bash
telnet <amf-host> 38412
```

3. Review logs for connection errors

## Security Best Practices

1. **Use TLS** for production deployments
2. **Firewall rules** to restrict access
3. **VPN** for mesh communication over public networks
4. **Authentication** for API endpoints
5. **Regular updates** of dependencies

## Performance Tuning

### Node.js

```bash
NODE_ENV=production node --max-old-space-size=4096 index.js
```

### PM2

```bash
pm2 start index.js -i max  # Cluster mode
```

### Network

- Adjust MTU for better performance
- Enable TCP BBR congestion control
- Configure QoS rules for 5G traffic
