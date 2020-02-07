

if [ ! -z "$1" ];
then
	echo "Add data:" 
	command="curl -H 'Content-Type: application/octet-stream' -X PUT --data-binary @pic.jpg localhost:8180/dataprovider/$1/pic.jpg"
	echo $command
	eval $command
else
	echo "Use the document id : _id to add data to process the job: bash 2.addData.sh _id"
fi



