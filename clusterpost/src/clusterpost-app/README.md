# clusterpost-'app'

Retrieve your running tasks from the clusterpost-server directly to your desktop. 

## Installation

----
	npm install clusterpost-app
----

## Create script

Create a script named `clusterpostapp.js` with the following content.

----
	require(clusterpost-app);
----

## Running the script

----
	`node clusterpostapp.js get`
----
or
----
	`node clusterpostapp.js post`
----


### get: 

----
	Help: Download tasks from the server.
	Optional parameters:
	--dir  Output directory, default: ./out
	--status one of [DONE, RUN, FAIL, EXIT, UPLOADING, CREATE], if this flag is provided, the job information will only be printed. By default, the behavior is status 'DONE' and download the results.
	--delete, default false, when downloading jobs with status 'DONE', the jobs will be deleted upon completion
	--j job id, default: all ids
	--executable executable, default: all executables
----

### post:

---
	Help: Submit tasks to the server. Parses a command line, uploads the data and runs the task.
    
    Optional parameters:
    --parse_cli 'command as you would run it locally in your computer. It will only print the job'
    --parse_cli_submit 'Parses cli and submits the task'
    --executionserver 'name of computing grid, uses the first one by default'
---


