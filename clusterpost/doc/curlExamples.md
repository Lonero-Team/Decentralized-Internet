
Create Job: 

``
curl -H Content-Type: application/json -X POST localhost:8180/dataprovider/ -d {"type": "job", "executable":"recon-all", "userEmail": "juanprietob@gmail.com"}
``

Add data: 
``
curl -X PUT -F file=@pic.jpg localhost:8180/dataprovider/52f388e8f3e8045a9f6260e86c0d0bd7/pic.jpg
``

Get job document:
``
curl localhost:8180/dataprovider/52f388e8f3e8045a9f6260e86c0d0bd7
``

Get job data:
``
curl localhost:8180/dataprovider/52f388e8f3e8045a9f6260e86c0d0bd7/pic.jpg
``
