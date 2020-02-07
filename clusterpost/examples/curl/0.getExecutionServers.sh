
echo "Get the execution servers available, you can change this parameter in the example.json file in case you want to submit your yob to another server. "
command="curl localhost:8180/executionserver"
echo $command
eval $command