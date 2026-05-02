# -------- BUILD STAGE --------
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    # Install deps
    COPY package*.json ./
    RUN npm ci
    
    # Copy source
    COPY . .
    
    # Build app
    RUN npm run build
    
    # -------- PRODUCTION STAGE --------
    FROM nginx:alpine

    # Pull in latest Alpine security fixes
    RUN apk update && apk upgrade --no-cache
    
    # Remove default nginx static files
    RUN rm -rf /usr/share/nginx/html/*

    # Run as non-root (k8s securityContext requires it)
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copy build output
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Expose port
    EXPOSE 8080
    
    # Run nginx
    CMD ["nginx", "-g", "daemon off;"]