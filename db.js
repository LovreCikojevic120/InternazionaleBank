const Pool=require("pg").Pool;

const pool=new Pool({
    user:"postgres",
    password:"fesb",
    host:"localhost",
    port:5432,
    database: "userstest"
});

module.exports=pool;