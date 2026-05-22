# Usa uma versão leve do Node
FROM node:18-alpine

# Cria a pasta do app dentro do container
WORKDIR /app

# Copia os arquivos de dependências e instala
COPY package*.json ./
RUN npm install

# Copia o resto do código da API
COPY . .

# Expõe a porta interna da API
EXPOSE 3000

# Comando para rodar a API
CMD ["npm", "start"]
