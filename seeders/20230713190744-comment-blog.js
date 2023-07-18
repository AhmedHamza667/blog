'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('comments', [{
      content: "comment 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      content: "comment 2",
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      content: "comment 3",
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

    await queryInterface.bulkDelete('comments', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
