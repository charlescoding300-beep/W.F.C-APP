function success(res, data = {}, status = 200) {
    return res.status(status).json({
        success: true,
        ...data
    });
}

function failure(
    res,
    status,
    code,
    message,
    details = undefined
) {
    const response = {
        success: false,
        error: {
            code,
            message
        }
    };

    if (details !== undefined) {
        response.error.details = details;
    }

    return res.status(status).json(response);
}

module.exports = {
    success,
    failure
};
