exports.up = async function(knex) {
	await knex.schema.createTable('veiculos', function(table) {
		table.increments('id').primary();
		table.string('placa').notNullable().unique();
		table.string('montadora').notNullable();
		table.string('modelo').notNullable();
	});

	await knex.schema.createTable('telemetria', function(table) {
		table.increments('id').primary();
		table.integer('veiculo_id').unsigned().notNullable();
		table.float('velocidade').notNullable();
		table.float('temperatura_motor').notNullable();
		table.timestamp('capturado_em').defaultTo(knex.fn.now());

		table.foreign('veiculo_id').references('id').inTable('veiculos').onDelete('CASCADE');
	});
};

exports.down = async function(knex) {
	await knex.schema.dropTable('telemetria');
	await knex.schema.dropTable('veiculos');
};
