exports.up = function(knex) {
	return knex.schema.createTable('veiculos', function(table) {
		table.increments('id').primary();
		table.string('placa').notNullable().unique();
		table.string('montadora').notNullable();
		table.string('modelo').notNullable();
	});
};

exports.down = function(knex) {
	return knex.schema.dropTable('veiculos');
};
