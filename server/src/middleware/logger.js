function logger(req, res, next) {

    console.log("Incoming Request");

    next();

}

export default logger;