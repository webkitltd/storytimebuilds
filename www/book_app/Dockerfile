FROM mhart/alpine-node:8
MAINTAINER kai@dotmesh.io

WORKDIR /app
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
RUN yarn install
COPY . /app
ENTRYPOINT ["npm", "run"]
CMD ["build"]