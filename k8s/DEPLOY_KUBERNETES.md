# Deploy OriginHub Frontend to Kubernetes

Follow these steps to deploy the OriginHub Next.js frontend to your existing Kubernetes cluster.

## Step 1: Build and Push Docker Image

```bash
# Build the Docker image
docker build -t originhub/frontend:latest .

# Tag for your registry (replace with your registry)
docker tag originhub/frontend:latest your-registry/originhub/frontend:latest

# Push to registry
docker push your-registry/originhub/frontend:latest
```

### Common Registries:

**Docker Hub:**

```bash
docker tag originhub/frontend:latest username/originhub-frontend:latest
docker push username/originhub-frontend:latest
```

**Google Artifact Registry:**

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
docker tag originhub/frontend:latest us-central1-docker.pkg.dev/YOUR_PROJECT_ID/originhub-registry/frontend:latest
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/originhub-registry/frontend:latest
```

**AWS ECR:**

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker tag originhub/frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/frontend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/frontend:latest
```

## Step 2: Update Deployment Manifest

Edit `k8s/deployment.yaml` and replace the placeholders:

```yaml
spec:
  template:
    spec:
      containers:
        - name: frontend
          image: your-registry/originhub/frontend:latest # Replace with your registry/image
          env:
            - name: NEXT_PUBLIC_API_URL
              value: "YOUR_API_URL" # Replace with your API URL
            - name: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
              value: "YOUR_CLERK_PUBLISHABLE_KEY" # Replace with your key
            - name: CLERK_SECRET_KEY
              value: "YOUR_CLERK_SECRET_KEY" # Replace with your key
```

## Step 3: Deploy to Kubernetes

```bash
# Create namespace (optional)
kubectl create namespace originhub-frontend

# Deploy
kubectl apply -f k8s/deployment.yaml -n originhub-frontend

# Check deployment status
kubectl get pods -n originhub-frontend

# Expected output:
# NAME                          READY   STATUS    RESTARTS   AGE
# originhub-frontend-xxx-yyy    1/1     Running   0          2m
# originhub-frontend-xxx-zzz    1/1     Running   0          2m
```

## Step 4: Verify Deployment

```bash
# Check service
kubectl get svc -n originhub-frontend

# Expected output:
# NAME                 TYPE           CLUSTER-IP    EXTERNAL-IP    PORT(S)
# originhub-frontend   LoadBalancer   10.0.0.1      34.101.x.x     80:30xxx/TCP

# Get external IP (may take a few minutes)
EXTERNAL_IP=$(kubectl get svc originhub-frontend -n originhub-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test the application
curl http://$EXTERNAL_IP
```

## Step 5: View Logs

```bash
# View logs from all pods
kubectl logs -f deployment/originhub-frontend -n originhub-frontend

# View logs from specific pod
kubectl logs pod/originhub-frontend-xxx-yyy -n originhub-frontend
```

## Step 6: Port Forward (for testing)

```bash
# Forward local port 3000 to frontend service
kubectl port-forward svc/originhub-frontend 3000:80 -n originhub-frontend

# Test
curl http://localhost:3000
```

## Troubleshooting

### Pod in CrashLoopBackOff

```bash
# Check logs
kubectl logs pod/originhub-frontend-xxx-yyy -n originhub-frontend --previous

# Check pod details
kubectl describe pod originhub-frontend-xxx-yyy -n originhub-frontend
```

### Image not found error

Make sure to:

1. Push image to registry
2. Update image URL in deployment.yaml
3. If using private registry, create image pull secret:

```bash
kubectl create secret docker-registry regcred \
  --docker-server=your-registry \
  --docker-username=username \
  --docker-password=password \
  -n originhub-frontend
```

Then add to deployment.yaml:

```yaml
spec:
  template:
    spec:
      imagePullSecrets:
        - name: regcred
```

### Application not responding

```bash
# Port forward and test manually
kubectl port-forward pod/originhub-frontend-xxx-yyy 3000:3000 -n originhub-frontend

# In another terminal
curl http://localhost:3000

# Check logs for errors
kubectl logs pod/originhub-frontend-xxx-yyy -n originhub-frontend
```

### Environment variables not loaded

```bash
# Verify secrets exist
kubectl get secrets -n originhub-frontend
kubectl describe secret originhub-secrets -n originhub-frontend

# Check pod environment
kubectl exec -it pod/originhub-frontend-xxx-yyy -n originhub-frontend -- env | grep -i clerk
```

## Update Deployment

```bash
# Update image
kubectl set image deployment/originhub-frontend \
  frontend=your-registry/originhub/frontend:v1.1.0 \
  -n originhub-frontend

# Monitor rollout
kubectl rollout status deployment/originhub-frontend -n originhub-frontend

# Rollback if needed
kubectl rollout undo deployment/originhub-frontend -n originhub-frontend
```

## Scale Deployment

```bash
# Scale to 5 replicas
kubectl scale deployment originhub-frontend --replicas=5 -n originhub-frontend

# Check scaling
kubectl get pods -n originhub-frontend
```

## Delete Deployment

```bash
# Delete all resources
kubectl delete -f k8s/deployment.yaml

# Or delete specific resources
kubectl delete deployment originhub-frontend -n originhub-frontend
kubectl delete svc originhub-frontend -n originhub-frontend
kubectl delete namespace originhub-frontend
```

## Useful Commands

```bash
# Get all resources
kubectl get all -n originhub-frontend

# Describe deployment
kubectl describe deployment originhub-frontend -n originhub-frontend

# Get resource usage
kubectl top pods -n originhub-frontend

# Edit deployment
kubectl edit deployment originhub-frontend -n originhub-frontend

# Port forward with specific pod
kubectl port-forward pod/originhub-frontend-xxx-yyy 3000:3000 -n originhub-frontend

# Execute command in pod
kubectl exec -it pod/originhub-frontend-xxx-yyy -n originhub-frontend -- /bin/sh

# Check events
kubectl get events -n originhub-frontend

# Watch pod status
kubectl get pods -n originhub-frontend -w
```

---

**Need help?** Run: `kubectl get pods -n originhub-frontend` to see your pods' status
