FROM keymetrics/pm2:8-alpine
RUN echo "https://mirrors.aliyun.com/alpine/v3.6/main" > /etc/apk/repositories \
    && echo "https://mirrors.aliyun.com/alpine/v3.6/community" >> /etc/apk/repositories \
    && apk update
COPY src src/
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
RUN npm install
RUN npm run build
ENTRYPOINT pm2-runtime ./build/main.js