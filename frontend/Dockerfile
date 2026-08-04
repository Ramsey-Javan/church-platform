FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Dev server with hot-reload. For a production image, replace this with a
# multi-stage build (npm run build -> serve /dist via nginx) — ask me for
# that version when you're ready to deploy.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]