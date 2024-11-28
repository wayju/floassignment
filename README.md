# Take home assignment for Flo

## Description

Console application for importing basic data from an NEM12 file. The console app reads a NEM12 CSV and writes it in transactional batches to the pgsql databse. Errors will be printed to the console for failed batches.

### Language Choice
I have used Typescript because I was interested in trying batch operations in Node.js. Unless a team had an intention to only use or primarily use typescript I would prefer a language intended for highly concurrent processing. I would prefer golang or c#. Python may also be a good choice since it is a popular tool for data pipelines.

The ORM used is a leightweight ORM that looked interesting after a quick search. I wouldn't endorse it without more experience.

## Getting Started

### Dependencies
* Docker if running with Docker, or otherwise, 
* Node.js >= v16.
* Bash (mac / linux) if using the helper script to upload/fetch files from the application in docker.'

A docker compose file is provided to bring up a pgsql database, pgadmin, and a container to run the console application. Example files and the source are mounted into the container for easier development and developer testing. 

### Steps
1. From the root directory of the project run `docker compose up`. Wait for the services to start. When the application container loads, changes to the src are monitored (`npx tsc --watch`) so that changes can be immediately tested.
2. To execute the application from outside the container run `docker exec -it flo node /app/dist/index.js -h`. This will show the application options. To import a file loaded in the container then use `docker exec -it flo node /app/dist/index.js --debug --file /app/examples/flo_sample.csv`. Two helper scripts are provded: `clean-db.sh` which will truncate the `meter-data` table. `./run.sh ./examples/flo_sample.csv` will upload a file to the container and import it.
3. `pgadmin` can be reached at `http://localhost:5050/` by default with the development username `admin@example.com` and password `postgres`. After logging in then the server will need to be added using host `postgres`, port `5432`, username `postgres` and password `postgres`. 

### Errors
If an error occurs the batch will fail with line content, error message and batch line numbers reported. Once processing is completed for the file this information will be logged.

### Notes
* Upon creation the database table will be created by an init script in `docker-compose-init`
* The database name used is floassignment.

## Improvements

* The application internal data pipeline has been somewhat drafted and could be unchanged if another protocol / protocol version is ever supported. It would be more elegant if the pipeline was encapsulated in its own right, so that the pipeline components would not reference themselves. This can though be difficult when some decisions about validation, and batching may require visibility of more than one record.
* Sample sanity test cases are presented for the record parsers. More unit tests would be required for these to cover difference cases. Unit tests would be required for other components throughout the data pipeline from reading, parsing, processing, writing.
* Transactional batching is basic with batches written per meter (when we recieve another 200 record) or at the end of the file. This will probably break in more advanced usecases of NEM12. This is also not ideal for cases where a large amount of meter data is read for a single meter in one go. To get true concurrent processing we would need to use multiple instances (or another language).
* The interface is a console app which in a production environment would push data pipeline orchestration to infrastructor. Arguably the application could do more to assist (i.e. read from a queue and manage failures itself).
* Error reporting is naieve and no retry support is offered. A system like this would typically have output files for unprocessed rows reporting errors which need manual intervention. That is much more helpful than searching logs.
* The NEM12 specification has business logic which could be built in to validate files. There is no validation implemented.
* There is no file validation at all.
