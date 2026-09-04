/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('veiculos').insert([
    {
      placa: 'DEF5678',
      montadora: 'Mercedes-Benz',
      modelo: 'Actros'
    },
    {
      placa: 'GHI9012',
      montadora: 'DAF',
      modelo: 'XF'
    }
  ]);
};
