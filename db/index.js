import Sequelize from 'sequelize'

const sequelize = new Sequelize('postgres://omar:917356Oo@localhost:5432/node-complete', {
    logging: false
})
export default sequelize