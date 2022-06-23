ARG tm_version=v0.35.7
FROM tendermint/tendermint:${tm_version}
LABEL maintainer "devs@bigchaindb.com"
WORKDIR /
USER root
RUN apk --update add bash
ENTRYPOINT ["/usr/bin/tendermint"]
