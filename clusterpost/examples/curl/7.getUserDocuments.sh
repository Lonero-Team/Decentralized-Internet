
echo "Get user document: optionally specify the status as well as a query parameter jobstatus=[RUN, FAIL, UPLOADING]"
command='curl localhost:8180/dataprovider/user?userEmail=juanprietob@gmail.com'
echo $command
eval $command
