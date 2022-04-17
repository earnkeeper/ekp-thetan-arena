FROM node:16.13.1

WORKDIR /app 

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY ./src ./src
COPY ./public ./public
COPY ./LICENSE ./
COPY ./nest-cli.json ./
COPY ./README.md ./
COPY ./tsconfig.build.json ./ 
COPY ./tsconfig.json ./ 

RUN ls -la
RUN npm run build


CMD ["npm","run","start:prod"]