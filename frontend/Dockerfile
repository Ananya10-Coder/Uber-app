# ---------- BUILD STAGE ----------
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy source
    COPY . .
    
    # Build the app
    RUN npm run build
    
    
    # ---------- PRODUCTION STAGE ----------
    FROM nginx:alpine
    
    # Remove default nginx config
    RUN rm /etc/nginx/conf.d/default.conf
    
    # Copy custom nginx config
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copy built files from builder
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Expose port 80
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    