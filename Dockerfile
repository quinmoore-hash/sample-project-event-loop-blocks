FROM node:26
#RUN apt-get update
#RUN apt-get install -y awscli
COPY main.mjs profiler-worker.mjs entrypoint.sh crash-report.sh ./
RUN mkdir -p /crash-reports && chown node:node /crash-reports
USER node
EXPOSE 8001
ENTRYPOINT ["/entrypoint.sh"]
