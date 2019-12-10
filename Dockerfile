# This image is based on the image from: https://github.com/scyv/meteor-docker-base
FROM meteor-base
LABEL maintainer="scyv@posteo.de"

ENV PORT=8080 \
    ROOT_URL="" \
    MAIL_URL="" \
    MONGO_URL="" \
    SRC_PATH=./

# Copy the app to the image
COPY ${SRC_PATH} /home/meteor/app

RUN chown meteor:meteor --recursive /home/meteor/app && \
    cd /home/meteor/app && \
    gosu meteor:meteor /home/meteor/.meteor/meteor npm install --production && \
    gosu meteor:meteor /home/meteor/.meteor/meteor build --directory /home/meteor/app_build && \
    cd /home/meteor/app_build/bundle/programs/server/ && \
    gosu meteor:meteor npm install && \
    mv /home/meteor/app_build/bundle /build && \
    rm -rf /home/meteor/app && \
    rm -rf /home/meteor/app_build

EXPOSE ${PORT}
USER meteor

CMD ["node", "/build/main.js"]
