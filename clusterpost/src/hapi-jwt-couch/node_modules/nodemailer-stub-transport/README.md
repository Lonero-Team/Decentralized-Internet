# Stub transport module for Nodemailer

Applies for Nodemailer v1.0

Stub transport does not send anything, it builds the mail stream into a single Buffer and returns it with the sendMail callback. This is useful for testing the emails before actually sending anything.

[![Build Status](https://travis-ci.org/andris9/nodemailer-stub-transport.svg?branch=master)](https://travis-ci.org/andris9/nodemailer-stub-transport) [![NPM version](https://badge.fury.io/js/nodemailer-stub-transport.svg)](http://badge.fury.io/js/nodemailer-stub-transport)

## Usage

Install with npm

```
npm install nodemailer-stub-transport
```

Require to your script

```javascript
var nodemailer = require('nodemailer');
var stubTransport = require('nodemailer-stub-transport');
```

Create a Nodemailer transport object

```javascript
var transport = nodemailer.createTransport(stubTransport());
```

Send a message

```javascript
transport.sendMail(mailData, function(err, info){
    console.log(info.response.toString());
});
```

or "verify" settings

```javascript
transport.verify(function(err, success){
    if (error) {
        console.log(error);
   } else {
        console.log('Server is ready to take our messages');
   }
});
```

## Errors

There's not much to error about but if you want the sending to fail and return an error then you can do this by specifying an error option when setting up the transport .

```javascript
var transport = nodemailer.createTransport(stubTransport({
    error: new Error('Invalid recipient')
}));
transport.sendMail(mailData, function(err, info){
    console.log(err.message); // 'Invalid recipient'
});
```

Setting an error also applies to the verify call

```javascript
transport.verify(function(err, success){
    console.log(err.message); // 'Invalid recipient'
});
```

### Using BCC

If you want to have BCC addresses included in the generated message, use `keepBcc` option

```javascript
var transport = nodemailer.createTransport(stubTransport({
    keepBcc: true
}));
```

### Events

#### 'log'

Debug log object with `{name, version, level, type, message}`

#### 'envelope'

Envelope object

#### 'data'

Data chunk

## License

**MIT**
