FROM node:20-alpine

ENV NODE_ENV=production
ENV PORT=4173

WORKDIR /app

COPY --chown=node:node package.json ./

RUN npm install

COPY --chown=node:node public ./public
COPY --chown=node:node server ./server

RUN node --check public/app.js \
    && node --check server/index.js

USER node

EXPOSE 4173

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4173').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/index.js"]