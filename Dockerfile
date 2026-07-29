FROM node:26
RUN apt-get update
RUN apt-get install -y expect
#RUN apt-get install -y awscli
COPY main.mjs entrypoint.sh crash-report.sh ./
EXPOSE 8001
ENTRYPOINT ["/entrypoint.sh"]