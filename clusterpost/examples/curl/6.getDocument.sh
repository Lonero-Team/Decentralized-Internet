
if [ ! -z "$1" ];
then

echo Get job document:
command='curl localhost:8180/dataprovider/'$1
echo $command
eval $command

else
	echo "Use the document id : _id to add get the job document created: sh getDocument.sh _id"	
fi