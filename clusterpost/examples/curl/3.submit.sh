if [ ! -z "$1" ];
then

echo "Launch the job execution"
command="curl -X POST localhost:8180/executionserver/"$1
echo $command
eval $command

else
	echo "Use the document id to submit the job: bash 5.submit.sh _id"	
fi