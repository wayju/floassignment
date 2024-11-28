# Take home assignment for Flo

## Description

Console application for importing basic data from an NEM12 file. 

### Language Choice
I have used Typescript because I was interested in expericing batch operations in Node.js. Unless a team had an intention to only use or primarily use typescript I would prefer a language intended for highly concurrent processing. Personally for me this would be golang or c#. Python would also be a good choice being a popular tool for data pipelines.

## Getting Started

A docker compose file is provided to bring up a psql database, pgadmin, and a container to run the console application. Example files and the source are mounted into the container for easier development and developer testing. When the application container loads changes to the src are monitored (`npx tsc --watch`) so that changes can be immediately tested.

To run the application from a host machine you can run docker `exec -it flo node /app/dist/index.js -h` for available options. To import a file loaded in the container then use `docker exec -it flo node /app/dist/index.js -h `. Two helper scripts are provded: `clean-db.sh` which will truncate the `meter-data` table, and `./run.sh ./examples/flo_sample.csv` which will upload a file to the container and import it.

Logging into pgadmin by default can be done at `http://localhost:5050/` using the development username `admin@example.com` and password `postgres`. After logging in then the server will need to be added using host `postgres`, port `5432`, username `postgres` and password `postgres`. 

### Errors
If an error occurs the current batch will fail with line content, error message and batch line numbers reported. Once processing is completed for the file this information will be logged.

### Dependencies
* Docker if running with Docker, or otherwise, 
* Node.js >= v16.
* Bash (mac / linux) if using the helper script to upload/fetch files from the application in docker.

## Improvements

* The application internal data pipeline has been somewhat drafted and could be unchanged if another protocol / protocol version is ever supported. It would be more elegant if the pipeline was encapsulated in its own right, so that the pipeline components would not reference themselves. This can though be difficult when some decisions about validation, and batching may require visibility of more than one record.
* Sample sanity test cases are presented for the record parsers. More unit tests would be required for these to cover difference cases. Unit tests would be required for other components throughout the data pipeline from reading, parsing, processing, writing.
* Transactional batching is basic with batches written per meter (when we recieve another 200 record) or at the end of the file. This will probably break in more advanced usecases of NEM12. This is also not ideal for cases where a large amount of meter data is read for a single meter in one go. To get true concurrent processing we would need to use multiple instances (or another language).
* The interface is a console app which in a production environment would push data pipeline orchestration to infrastructor. Arguably the application could do more to assist (i.e. read from a queue and manage failures itself).
* Error reporting is naieve and no retry support is offered. A system like this would typically have output files for unprocessed rows reporting errors which need manual intervention. That is much more helpful than searching logs.
* The NEM12 specification has business logic which could be built in to validate files. There is no validation implemented.