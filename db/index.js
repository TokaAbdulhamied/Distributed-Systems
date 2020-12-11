import Sequelize from 'sequelize'

const sequelize = new Sequelize("postgres://postgres:postgres@localhost:5666/postgres", {
    logging: false
})
export default sequelize