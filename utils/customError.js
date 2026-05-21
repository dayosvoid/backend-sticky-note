class customError extends Error{
    constructor(message, statucode){
        super(message);
        this.statuscode = statuscode;
        this.status = this.statuscode && this.statuscode >= 400 && this.statuscode < 500 ? this.status = "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = customError