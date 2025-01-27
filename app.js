const express = require('express'),
	bodyParser = require('body-parser'),
	OAuth2Server = require('oauth2-server'),
	Request = OAuth2Server.Request,
	Response = OAuth2Server.Response;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.oauth = new OAuth2Server({
	model: require('./model.js'),
	accessTokenLifetime: 60 * 60,
	allowBearerTokensInQueryString: true
});

app.get('/', authenticateRequest, function (req, res) {
	console.log(res.locals.token.user)
	res.send('Congratulations, you are in a secret area!');
});

app.all('/oauth/token', token);
app.all('/oauth/authorize', authorize);

app.listen(3000);

function token(req, res) {
	let request = new Request(req);
	let response = new Response(res);
	return app.oauth.token(request, response)
		.then((token) => 
			res.json(token)
		)
		.catch((err) => 
			res.status(err.code || 500).json(err)
		);
}

function authorize(req, res) {
	let request = new Request(req);
    let response = new Response(res);
	return app.oauth.authorize(request, response)
		.then((code) => 
			res.json(code)
		)
		.catch((err) => 
			res.status(err.code || 500).json(err)
		);
}

function authenticateRequest(req, res, next) {
	let request = new Request(req);
	let response = new Response(res);
	return app.oauth.authenticate(request, response)
		.then(function (token) {
			console.log('Accessed with token:', token);
			res.locals.token = token;
			next();
		}).catch(function(err) {
			res.status(err.code || 500).json(err);
		});
}
