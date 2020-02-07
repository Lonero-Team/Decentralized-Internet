
if [ ! -z "$1" ];
then

processeddata="pic.eps"

echo "Get the test job data:"
command='curl localhost:8180/dataprovider/'$1'/'$processeddata > $processeddata
echo $command
eval $command

else
	echo "Use the document id : _id to get the processeddata sh 5.getProcessedData.sh _id"	
fi