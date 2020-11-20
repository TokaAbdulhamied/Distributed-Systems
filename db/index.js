import Sequelize from 'sequelize'

const sequelize = new Sequelize('postgres://jdzcbemp:ChFZ6yoWf0lwgANk744zf5slxVCuorbR@kandula.db.elephantsql.com:5432/jdzcbemp ', {
    logging: false
})

export default sequelize