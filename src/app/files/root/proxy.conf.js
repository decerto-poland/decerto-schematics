module.exports = {
	'/api/': {
		target: 'http://localhost:8080/<%= prefix =>/',
		secure: false
	}
};
