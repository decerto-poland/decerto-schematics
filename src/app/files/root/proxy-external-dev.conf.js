module.exports = {
	'/api/': {
		target: 'https://<%= prefix =>-dev.decerto.pl/<%= prefix =>/',
		logLevel: 'debug',
		changeOrigin: true,
		secure: true
	}
};
