docker stop client
docker rm client
cd simiwebapp/client
docker build -t client .
cd ../..

#docker stop webappserver
#docker rm webappserver
#cd simiwebapp/server
#docker build -t webappserver .
#cd ../..

docker stop mobileappserver
docker rm mobileappserver
cd simimobileapp/server
docker build -t mobileappserver .
cd ../..

docker-compose up -d --build
