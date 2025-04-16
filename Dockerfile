#define a versão do node.js
FROM node:22.4.0-alpine3.16

#define o diretório de trabalho dentro do container com linux
WORKDIR /app

## Copia o arquivo de configuração do npm para o container
COPY package.json .

#instala as dependências
RUN npm install 

## Copia o restante dos arquivos para o container
COPY . .

#expor a porta 3000 para o host
EXPOSE 3000

#define o comando para inicializar a aplicação
CMD ["npm", "start"]