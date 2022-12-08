docker build . -t sf-testing
docker run -p "8228:8228" sf-testing