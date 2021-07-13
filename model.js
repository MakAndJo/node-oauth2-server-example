/**
 * Configuration.
 */

var config = {
	clients: [{
		id: 'application',	// TODO: Needed by refresh_token grant, because there is a bug at line 103 in https://github.com/oauthjs/node-oauth2-server/blob/v3.0.1/lib/grant-types/refresh-token-grant-type.js (used client.id instead of client.clientId)
		clientId: 'application',
		clientSecret: 'secret',
		grants: [
			'password',
			'refresh_token'
		],
		redirectUris: ['http://example.org/oauth2'],
		scopes: ['read', 'write']
	}],
	confidentialClients: [{
		clientId: 'confidentialApplication',
		clientSecret: 'topSecret',
		grants: [
			'password',
			'client_credentials'
		],
		redirectUris: []
	}],
	tokens: [],
	codes: [],
	users: [{
		username: 'pedroetb',
		password: 'password'
	}]
};

/**
 * Dump the memory storage content (for debug).
 */

var dump = function() {

	console.log('clients', config.clients);
	console.log('confidentialClients', config.confidentialClients);
	console.log('tokens', config.tokens);
	console.log('users', config.users);
};

/*
 * Methods used by all grant types.
 */

var getAccessToken = function(token) {

	var tokens = config.tokens.filter(function(savedToken) {
		return savedToken.accessToken === token;
	});

	return tokens[0];
};

/*
 * Methods used only by refresh_token grant type.
 */

var getRefreshToken = function (refreshToken) {

	var tokens = config.tokens.filter(function (savedToken) {
		return savedToken.refreshToken === refreshToken;
	});

	if (!tokens.length) {
		return;
	}

	return tokens[0];
};

const getAuthorizationCode = function (code) {
	let codes = config.codes.filter(savedCode => savedCode.code === code);
	if (!codes.length) return;
	return codes[0];
}

var getClient = function(clientId, clientSecret) {

	var clients = config.clients.filter(function(client) {
		return client.clientId === clientId && client.clientSecret === clientSecret;
	});

	var confidentialClients = config.confidentialClients.filter(function(client) {
		return client.clientId === clientId && client.clientSecret === clientSecret;
	});

	return clients[0] || confidentialClients[0];
};

var saveToken = function(token, client, user) {
	token.client = { id: client.clientId };
	token.user = { username: user.username };
	config.tokens.push(token);
	return token;
};

const saveAuthorizationCode = function (code, client, user) {
	code.client = { id: client.clientId };
	code.user = { username: user.username };
	config.codes.push(code);
	return code;
}

/*
 * Method used only by password grant type.
 */

var getUser = function(username, password) {

	var users = config.users.filter(function(user) {
		return user.username === username && user.password === password;
	});

	return users[0];
};

/*
 * Method used only by client_credentials grant type.
 */

var getUserFromClient = function(client) {

	var clients = config.confidentialClients.filter(function(savedClient) {
		return savedClient.clientId === client.clientId && savedClient.clientSecret === client.clientSecret;
	});

	return clients.length;
};

var revokeToken = function(token) {

	config.tokens = config.tokens.filter(function(savedToken) {
		return savedToken.refreshToken !== token.refreshToken;
	});

	var revokedTokensFound = config.tokens.filter(function(savedToken) {
		return savedToken.refreshToken === token.refreshToken;
	});

	return !revokedTokensFound.length;
};

//const VALID_SCOPES = ['read', 'write'];
const SCOPE_SEPERATOR = ',';

const validateScope = function (user, client, scope) {
	return !scope ? ['*'] : scope
		.replace(/\s+/g, '')
		.split(SCOPE_SEPERATOR)
		.filter(s => client.scopes.indexOf(s) >= 0)
		.join(SCOPE_SEPERATOR);
};

const verifyScope = function (token, scope) {
	if (!token.scope) return false;
	let requestedScopes = scope.replace(/\s+/g, '').split(SCOPE_SEPERATOR);
	let authorizedScopes = token.scope.replace(/\s+/g, '').split(SCOPE_SEPERATOR);
	return requestedScopes.every(s => authorizedScopes.indexOf(s) >= 0);
}

/**
 * Export model definition object.
 */

module.exports = {
	getAccessToken: getAccessToken,
	getRefreshToken: getRefreshToken,
	getAuthorizationCode: getAuthorizationCode,
	getClient: getClient,
	getUser: getUser,
	getUserFromClient: getUserFromClient,
	saveToken: saveToken,
	saveAuthorizationCode: saveAuthorizationCode,
	revokeToken: revokeToken,
	validateScope: validateScope,
	verifyScope: verifyScope
};
