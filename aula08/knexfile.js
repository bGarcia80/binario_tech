const path = require('path');

module.exports = {
	development: {
		client: 'better-sqlite3',
		connection: {
			filename: path.resolve(__dirname, 'database.sqlite')
		},
		useNullAsDefault: true,
		migrations: {
			directory: path.resolve(__dirname, 'src', 'database', 'migrations')
		}
	}
};

