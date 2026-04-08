# ─── Stage 1 : Build React ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Dépendances d'abord (cache Docker optimal)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Sources
COPY . .

# Build production (mode desktop = pointe vers VITE_API_URL du .env.prod)
ARG VITE_API_URL
ARG VITE_ENV=production
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENV=$VITE_ENV

RUN yarn build

# ─── Stage 2 : Servir avec Nginx ─────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copier le build React
COPY --from=builder /app/dist /usr/share/nginx/html

# Config Nginx pour SPA (React Router — fallback sur index.html)
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # Gzip\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;\n\
\n\
    # Cache assets statiques (js/css/images)\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
        try_files $uri =404;\n\
    }\n\
\n\
    # SPA fallback — toutes les routes → index.html (React Router gère)\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
