# Docker 101 Workshop

##Materials**
You can download the [slides here](https://docs.google.com/presentation/d/1mYvE4jLb5xjZXzY3ksYOTcuI7Wf6E7ot-yT-ozlA20Q/edit?usp=sharing)

## Lab 1:

## Containerize the demo application

In this section you will clone the GitHub repository for our demo application, a Node/Express based guestbook API. As an optional exercise you can choose to run the app locally before containerizing it in the next section.  

* Open a terminal session / command prompt on your local computer. You can use Docker Desktop’s integrated terminal if you are on a newer version.
  
* In the terminal session clone the lab repo: 

    ```bash
    git clone https://github.com/mikegcoleman/101-Workshop.git
    ```


* Change into the Lab-1 directory
  
   ```bash
   cd 101-Workshop/Lab-1
   ```
     
    This directory includes  a simple Node application that provides a guestbook API.

* The application we are using runs on port 5000 by default, however it could be that port is not available on your system. To accomodate we use an environment variable `HOST_PORT` to set the right port we will use on our local machine. If port 5000 is not availble on your machine, change the value below to one that works for you otherwise just copy and paste the command below as is. 

  ```bash
  HOST_PORT=5000
  ```

* If you have Node and NPM installed on your local machine you can test the application to make sure it’s working.  If you do not have Node and NPM installed skip to the next section “***Build the application image***” 

* Otherwise use NPM to install the app dependencies and start the application: 

    ```bash
    npm install && PORT=$HOST_PORT npm run start 
    ```
* If you see a message “Backend is running on Port 5001” the app is running. To test it you can ***open a second terminal window*** and issue a curl command against the API

    ```bash
    curl http://localhost:$HOST_PORT/api/entries
    ```

* You should get back list of JSON objects that the application has prepopulated

* After you have tested your application, move back to the terminal window where the API was started and use ‘`ctrl-c`’ to stop the application.


### Build the application image

In this section you will build a Dockerfile for your application, and then test it to ensure it’s working.  
 
Feel free to consult the slides and/or other resources to complete this section. 


* In your favorite text editor open the Dockerfile in the Lab-1 directory. This Dockerfile has been scaffolded out to include the commands necessary to run our application.  Your task is to complete each of the commands in the Dockefile. If you get stuck, look back at the slides, use Google, or your favorite LLM to see if you can find the solution. If none of that works, there is a solution shown under the `101-Workshop/Solutions/Lab-1 `directory you can copy and paste from. 

* Once you have a Dockerfile you believe is working you will need to build and run it to test it out. Use the `docker build `command in a terminal window to create the container image.  The following command tells docker to build an image named ‘api’ and tag it as ‘v1’. 

    ```
    docker build -t api:v1 .
    ``` 
 
* The first line of output should indicate that the build finished: 
 
	`[+] Building 1.9s (9/9) FINISHED   `

### Run the application container

* With your application image built, you can test it out by running the following command: 

    ```
    docker run -d -p $HOST_PORT:5000 --name api api:v1
    ```
 
* If you issue the `docker ps` command you should see your running container. 

    ```
    CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS                    NAMES
    5b615934ac53   api:v1    "docker-entrypoint.s…"   2 seconds ago   Up 2 seconds   0.0.0.0:5000->5000/tcp   api
    ```


* You can `curl` against the API to see its working. Notice you are running `curl` against` http://localhost:$HOST_PORT `because when you started the container you mapped your chosen port on the localhost to port 5000 on the container, so Docker is routing the request appropriately.  
  
	` curl http://localhost:$HOST_PORT/api/entries`

### View resources in the Docker Desktop GUI

You can view the resources you just created in the Docker Desktop GUI.

* Open the Docker Desktop GUI and click “Images” from the left hand menu. Here you should see the image you created earlier. 

* Click on the name of the image, and you can see image details. Including the commands used to build the image. This is great if you don’t have a Dockerfile to refer back to but are curious how an image was built. Note you can get this same output from the Docker Desktop CLI by typing `docker history <image name>`

* Click on “Containers” from the left hand menu. Then click on the name of the API container you just started. Here you can view container logs and other details about the container. This is similar to using commands like `docker logs` and `docker inspect` from the CLI. 

* Click on builds from the left hand menu and you can see your build history. If you click on the build you just executed, you’ll notice details on how the build ran. This is useful to see how efficiently you are using the cache and other factors that can affect build times. 


## Lab 2


## Add a database for the API

In this section our API has been modified to write to a database rather than store the entries in memory. You will be adding the database, and configuring it to work with our API. 


## Start the new version of the API image



* Change into the Lab-2 directory

    ```
    cd ../Lab-2
    ```


* As in Lab 1 use a text editor to fill in the Dockefile using the best practice of separating dependencies from the application code. Again if you get stuck check the slides, Google, an LLM, or the Solutions directory for this lab. 
* Build the image for the updated API

    ```
    docker build -t api:v2 .
    ```


* Remove the old version of the API and start the new one

    ```
    docker rm -f api

    docker run -d -p $HOST_PORT:5000 --name api api:v2
    ```


* Check the status of the API

    ```
    docker ps -a

    ```



### Debug the API container

The container has exited with an error. Can you sort out why this happened? 
 
There are a couple of Docker commands you could use. The first is `docker logs` which will show you whatever the running container has written to `STDOUT` or `STDERR`. The other is `docker debug` which allows you to shell into a container, even one that has stopped. 

* Start a debug session on the API container

    ```
    docker debug api:v2
    ```



    Docker has instantiated a shell into your API container. At this point you could try a few different things to see what might have happened. 

* You know the API server communicates on port 5000, maybe that port didn’t get opened. You can use `nmap` to check for open ports on a host.

    ```
    nmap localhost
    ```



    As you might expect `nmap` is not part of your container image. 


    One of the advantages of debug is that it comes with a built-in toolbox of preinstalled tools and utilities. And, if there is a tool you need that isn’t installed you can add it to the toolbox. Adding a new utility does not affect the underlying container or image, it only adds it to the toolbox which makes it available during this and future debug sessions. 

* Install nmap into the Docker Debug toolbox and run it

    ```
    install nmap

    nmap localhost
    ```



    `nmap `doesn’t report any open ports, but that is expected because the API is not running, so the port should be closed. 

* You can actually try and run the API here in the debug shell

    ```
    node index.js
    ```



    You can see from the output that the API has failed because we have not provided a URL to reach the database, which is also expected since the database is not yet started. 

* Exit the debug session

    ```
    exit

    ```


Note that you can also run debug from inside the Docker Desktop GUI. On a container’s detail page under the “exec” tab choose “Enable debug mode” to start a debug session. 


### Start the database container



* In order for both containers to communicate with each other they need to be on the same virtual network. Create a new network for your application.

    ```
    docker network create guestbook
    ```


* Start the Postgres container. `-e` passes an environment variable into the container, and `--network` instructs Docker to place the container on the specified network. 

    ```
    docker run -d \
      --name db \
      -e POSTGRES_USER=api \
      -e POSTGRES_PASSWORD=Pa$$w0rd \
      -e POSTGRES_DB=guestbook \
      -p 5432:5432 \
      --network guestbook \
      postgres
    ```


* The API expects the database url as an environment variable. Remove the errored out container, and start a new instance passing in that URL. By placing both containers on the `guestbook` network, they can find each other by using DNS based service discovery

    ```
    docker rm -f api

    docker run -d \
      --name api \
      --network guestbook \
      -p $HOST_PORT:5000 \
      -e DB_URL="postgresql://api:Pa$$w0rd@db:5432/guestbook" \
      api:v2
    ```


* Verify the API is working 

    ```
    curl http://localhost:$HOST_PORT/api/entries
    ```



    We get back a message that the API can connect to the database, but there were no records to return.`  `

* Add a new entry

    ```
    curl -X POST http://localhost:$HOST_PORT/api/entries -H "Content-Type: application/json" -d '{"name": "John Doe", "message": "This is a test entry!"}'
    ```


* Verify the new record is in the database

    ```
    curl http://localhost:$HOST_PORT/api/entries
    ```


* Right now the data is saved in the database, however the database’s data is not persisted between restarts (due to the default ephemeral nature of containers). Go ahead and restart the containers, and try to list the data. 

    ```
    docker rm -f db

    docker rm -f api
        
    docker run -d \
      --name db \
      -e POSTGRES_USER=api \
      -e POSTGRES_PASSWORD=Pa$$w0rd \
      -e POSTGRES_DB=guestbook \
      -p 5432:5432 \
      --network guestbook \
      postgres

    sleep 10

    docker run -d \
      --name api \
      --network guestbook \
      -p $HOST_PORT:5000 \
      -e DB_URL="postgresql://api:Pa$$w0rd@db:5432/guestbook" \
      api:v2
    ```


* See if the added record is still there

    ```
    curl http://localhost:$HOST_PORT/api/entries
    ```



    As expected the recently added record is gone.

* Create a volume to hold the database data

    ```
    docker volume create db_data
    ```

* Restart the containers, this time using a volume w/ the database

    ```
    docker rm -f db

    docker rm -f api 

    docker run -d \
      --name db \
      -e POSTGRES_USER=api \
      -e POSTGRES_PASSWORD=Pa$$w0rd \
      -e POSTGRES_DB=guestbook \
      -p 5432:5432 \
      --network guestbook \
      -v db_data:/var/lib/postgresql/data \
      postgres

    sleep 10

    docker run -d \
      --name api \
      --network guestbook \
      -p $HOST_PORT:5000 \
      -e DB_URL="postgresql://api:Pa$$w0rd@db:5432/guestbook" \
      api:v2
    ```


* Add some data to the database

    ```
    curl -X POST http://localhost:$HOST_PORT/api/entries -H "Content-Type: application/json" -d '{"name": "John Doe", "message": "This is a test entry!"}'
    ```

* Verify the data was written

   ```
   curl http://localhost:$HOST_PORT/api/entries
   ```

* Stop and restart the containers

    ```
    docker rm -f db

    docker rm -f api 

    docker run -d \
      --name db \
      -e POSTGRES_USER=api \
      -e POSTGRES_PASSWORD=Pa$$w0rd \
      -e POSTGRES_DB=guestbook \
      -p 5432:5432 \
      --network guestbook \
      -v db_data:/var/lib/postgresql/data \
      postgres

    sleep 10

    docker run -d \
      --name api \
      --network guestbook \
      -p $HOST_PORT:5000 \
      -e DB_URL="postgresql://api:Pa$$w0rd@db:5432/guestbook" \
      api:v2
    ```


* Verify the data persisted across the restart this time

   ```
   curl http://localhost:$HOST_PORT/api/entries
   ```

* Remove the application containers, network, and volume

    ```
    docker rm -f api
    docker rm -f db
    docker volume rm db_data
    docker network rm guestbook

    ```

## Lab 3 


### Docker init: The easier way

In the previous labs you did a lot of manual work to build an optimized Dockerfile, add a database, create a volume, etc. However, there is actually a much easier way to do much of this work, it’s called` docker init`. This command will either scaffold out the Docker infrastructure for a new app, or, if run on an existing codebase, it will create code-specific Docker resources. 



* Move into the Lab 3 directory

    ```
    cd ../Lab-3
    ```

* Lab 3 only has the `index.js` and `package.json` files. You will use `docker init` to create the necessary Docker resources. 

   ```
   docker init
   ```



* Follow the prompts and provide the following information


    * Language: `Node`
    * Version: `16`
    * Package manager: `NPM`
    * Command to start the app: `node index.js`
    * Port: `5000`

    At this point docker init has created several files for you including a Dockerfile, Docker Compose file, a .`dockerignore` file, and a README. 

* Docker suggests running `docker compose up` at this point

    ```
    docker compose up --build
    ```


* But, as we saw previously our API needs a database to run. Luckily `docker init` has done a lot of work on that front as well. 

* Use your favored text editor to open `compose.yam`l.` docker init` added the commands to not only start our application, but also included an option to use a database. This Compose file is 99% of the way done, but you do need to make a few quick edits to get it fully functional. 

* After reviewing them, delete the comment lines in the  middle of the compose file that describes the various parts of the compose file. This would be all the comments between the “`ports`” and  “`depends_on`” sections 

* Uncomment the remaining lines starting with the “`depends_on`” section all the way to the end of the file

* Add the following line under the “`depends_on`” section 

    ```
    secrets:
      - db-password
    ```
    
    Your edited compose.yaml should look like this. Pay careful attention to the indentation. If it’s not correct, Docker Compose will fail.

    ```
    services:  
      server:
        build:
          context: .
        environment:
          NODE_ENV: production
        ports:
          - 5000:5000
        depends_on:
          db:
            condition: service_healthy
        secrets:
          - db-password
    

      db:
        image: postgres
        restart: always
        user: postgres
        secrets:
          - db-password
        volumes:
          - db-data:/var/lib/postgresql/data
        environment:
          - POSTGRES_DB=example
          - POSTGRES_PASSWORD_FILE=/run/secrets/db-password
        expose:
          - 5432
        healthcheck:
          test: [ "CMD", "pg_isready" ]
          interval: 10s
          timeout: 5s
          retries: 5
    volumes:
      db-data:
    secrets:
      db-password:
        file: db/password.txt
    ```


* Save the file, and bring the application up again using Docker Compose. There is no need to rebuild the API container, but you do want the containers to start in the background hence the removal of `--build` and the inclusion of `-d`

   ```
   docker compose up -d
   ```

* If you move into the containers area in the Docker Desktop GUI, you can see our Compose application there. 

* Add an entry to the database

    ```
    curl -X POST http://localhost:$HOST_PORT/api/entries -H "Content-Type: application/json" -d '{"name": "John Doe", "message": "This is a test entry!"}'
    ```


* Verify the new entry was written to the database

    ```
    curl http://localhost:$HOST_PORT/api/entries
    ```


* Stop the application
 
    ```
    docker compose down
    ```



* When you take a compose application down the containers are removed, but not the volume. That needs to stay as it contains data you want to persist. You can verify this by listing out the volumes and looking for `Lab-3_db_data`

    ```
    docker volume ls
    ```


* You can also view volumes in the Docker Desktop GUI from the Volumes entry in the left-hand menu.  

* Restart the application


    ```
    docker compose up -d
    ```



* Verify the data persisted across the restart

    ```
    curl http://localhost:$HOST_PORT/api/entries
    ```

* You can remove all created resources by stopping the Compose application. 

    ```
    docker compose down --volumes
    ```
