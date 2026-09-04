exports.up = function(knex) {
	return knex.schema.createTable('veiculos', function(table) {
		table.increments('id').primary();
		table.string('placa').notNullable().unique();
		table.string('montadora').notNullable();
		table.string('modelo').notNullable();
		table.string('status').defaultTo('DISPONIVEL');

	table.timestamp('criado_em').defaultTo(knex.fn.now());
	});
};

exports.down = function(knex) {
	return knex.schema.dropTable('veiculos');
};
