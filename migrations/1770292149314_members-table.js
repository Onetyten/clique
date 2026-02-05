/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('members',{
        id:{ type:'uuid',primaryKey:true, default:pgm.func('gen_random_uuid()')},
        room_id: {type:'uuid',notNull:true,references:'rooms'},
        name: { type:'text', notNull:true },
        role: {type:'smallint',notNull:true},
        color: {type:'text',default:"#57A8A8"},
        score:{type:'integer',notNull:true,default:0},
        joined_at: { type: 'timestampz', notNull: true, default: pgm.func('now()'),
        was_gm:{ type:'boolean',default:false }
    },

    });

    pgm.addConstraint('members','members_role_check',{
        check: 'role In (0,1)'
    });


};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable("members")
};
