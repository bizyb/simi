docker stop client
docker rm client
cd client
docker build -t client .
cd ..
docker stop server
docker rm server
cd server
docker build -t server .
cd ..
docker-compose up -d --build
