const path = require('path');

module.exports = {
	development: {
		client: 'better-sqlite3',
		connection: {
			filename: path.resolve(__dirname, 'database.sqlite')
		},
		useNullAsDefault: true,
		pool: {
			afterCreate: (conn, cb) => {
				conn.exec('PRAGMA foreign_keys = ON;');
				cb(null, conn);
			}
		},
		migrations: {
			directory: path.resolve(__dirname, 'src', 'database', 'migrations')
		}
	}
};
