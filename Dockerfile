FROM node:lts

RUN mkdir -p /app
COPY ./* /app
WORKDIR /app
RUN npm install
COPY . /app
CMD npm start
