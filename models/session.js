import db from '../db/index.js'
import Sequelize from 'sequelize'


const Session = db.define("session", {
    sid: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,

    },
    sess: {
        type: Sequelize.JSON,
        allowNull: false
    },
    expire: {
        type: Sequelize.DATE,
        allowNull: false
    }
}, {
    indexes: [
        {
            fields: ['expire'],
            name: 'IDX_session_expire'
        }
    ],
    timestamps: false,
    freezeTableName: true,
})

export default Session;