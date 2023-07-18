'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('posts', [{
      content: "post 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      content: "post 2",
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      content: "post 3",
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
    
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.bulkDelete('posts', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
