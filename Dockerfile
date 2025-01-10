FROM node:18-alpine as builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código fonte
COPY . .

# Gerar build
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar arquivos de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 