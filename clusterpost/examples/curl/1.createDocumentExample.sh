

echo Creating job:

command="curl -H 'Content-Type: application/json' -X POST localhost:8180/dataprovider --data @../data/example.json"

echo $command
eval $command

