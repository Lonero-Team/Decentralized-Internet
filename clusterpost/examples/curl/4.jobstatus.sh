if [ ! -z "$1" ];
then

echo "Check for the job status:"
command="curl localhost:8180/executionserver/"$1
echo $command
eval $command

else
	echo "Use the document id to check for a particular job status: bash 6.submit.sh _id"	
fi
