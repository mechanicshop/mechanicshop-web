FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

FROM node:22-alpine AS runtime

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=build /app/dist/MechanicsShop.Client ./dist/MechanicsShop.Client

EXPOSE 4000

CMD ["node", "dist/MechanicsShop.Client/server/server.mjs"]
