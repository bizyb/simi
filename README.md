# Initial setup on a new machine
---

We need to setup the machine with docker and docker-compose. In addition, we need to 
create volumes required by some of the containers. The only one we need to create 
explicitly is for mongodb. The script is written for Ubuntu 18 LTS. Update accordingly
for older distributions.

1. Go into /simiwebapp
2. Issue ./masters_start.sh


# SSL
---
Simi uses Let's Encrypt for SSL certificate signing. Let's Encrypt's certificates are valid for 90 days so they need to be renewed at least 30 days before the expiration. Although setting up Let's Encrypt and auto-renewing is complicated, we have a script (thanks to @wmnnd) that automates the process. 

@wmnnd's script uses Certbot, which needs to verify server/domain ownership before 
issuing any certificates. Domain name ownership needs to be verified just once. We
don't need to do the verification if the machine is new, unless the domain name is 
also new/Certbot doesn't have a record of it. If the domain name pointing to this 
machine is new:

1. Go into /simiwebapp
2. Issue ./init-letsencrypt.sh (note that simichat.net and an email is filled out)
3. Accept on-screen prompts to obtain the certificate
4. The script will terminate and destroy the temp docker containers on Ctrl-C after
    the certificate has been issued
5. The certificate and keys are stored in /data/certbot/


# Nginx
---

Nginx conf file, named app.conf, is setup to serve:
- ReactJS web client (at /)
- NodeJS web server (reverse proxy at /web/)
- NodeJS app server (reverse proxy at /mobile/)

app.conf is configured to load the SSL certifcate and keys automatically from the
mounted volume. In addition, it's docker-compose command is setup to check for updated 
key files every six hours. 


# Containerization
---

Simi is micro-service based. Each micro-service is containerized and here's a list of 
all the containers:
- mongodb

    Runs on its default port number, 27017. Data store is mounted from /data/db
- certbot

    Always up and running but issues certificate renewal request once a week. It loads it's data from ./data. Note that this is not the same as /data.  
- ReactJS + Nginx 

    The react app is just static js, css, and html files. Nginx acts as a static file server here. 
- NodeJS web server on port 5000

    This is the gateway server. It's used primarily for service Privacy Policy and Terms of Service. It's also setup with a REST endpoint to retrieve the current mobile endpoint. At the moment, the mobile endpoint is hard-coded into the app. However, in the future, we might need to move it around a bit. When that happens, the mobile endpoint will change. The gateway server is designed to be very light-weight so it may not be able to handle the load if we use it as a full proxy. Instead, the endpoint would be requested once per app install. 

    The gateway server is also host the landing page for the app in the future and the dashboard for interacting with the mobile server. This dashboard will allow us to perform analytics, send messages to users, etc. the scaffolding is there but there's no imperative for it at the moment so we'll keep it in the backburners. 

- NodeJS mobile server on port 5001

    This is *the* endpoint of the app. It handles real-time chat and all other good stuff. Right now it's implemented asynchronously without any blocking operations. However, it's primarily implemented as a proof-of-concept for future implementation in Phoenix+Elixir. Until then, it should be resilient enough to handle a reasonable amount of load, e.g. a few thousand conconcurrent connections.

# Container security
The docker-compose file is written so as not to publicly expose internal port 
numbers, e.g. mongodb and both the node servers. Instead, only the gateway 
server is exposed. The containers all are part of webappnetwork docker network.

When performing reverse proxy, Nginx may run into a problem, where it's unable 
to resolve the hostname of the target server. Creating a docker network addresses
this issue. Internally, docker sets up the DNS and DHCP. When Nginx wants to 
resolve the hostname, docker resolves it using the hostnames defined in docker-compose.
This should also be instructive: most doker intra-container communication problems 
can be solved by looking at/working with container_name and hostname directives in
docker-compose.

# Deployment
---
- Dev

    Enable DEBUG mode by going into:
    - simiwebapp/server/utils for the gateway server, 
    - simimobileapp/server/settings for the mobile server 
    - simimobileapp/Simi/src/utils/utils for the mobile app. 
    
    This will enable console logs. 

- Production

    Set DEBUG to false by going to the indicated files. 

### Build 
Inside the /simi directory, issue ./start.sh. This will build the necessary 
images for docker-compose and then issue docker-compose up command to bring up 
all the containers online. In addition, the start script will kill and remove 
any running containers belonging to the either of the node servers. Mongodb and 
certbot containers are never touched and should never be touched. 

### Endpoints 
The dashboard endpoint is /TepjFoNC1 (full: https://simichat.net/TepjFoNC1). This
is where future dashboard will reside. For now, it only acts as a place to set 
the mobile app endpoint. 

To login into the dashboard, use the username *bmelesse* and password *IDfc6FQ_F*.
This user is automatically created.

# TODO 
- [x] Deploy for beta testing
- [ ] supervisord/k8 to manage the containers 
- [ ] secure endpoints where user login status check isn't already being done