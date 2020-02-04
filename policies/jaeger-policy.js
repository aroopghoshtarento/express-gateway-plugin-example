var jaeger = require('./jaeger')
const jsonParser = require('express').json();
const urlEncoded = require('express').urlencoded({ extended: true });
const tracer = jaeger("anuvaad");
const { PassThrough } = require('stream');

module.exports = {
    name: 'jaeger-policy',
    policy: (actionParams) => {
        return (req, res, next) => {
            let contentType = 'application/x-www-form-urlencoded';
            jsonParser(req, res, (err) => {
                if (err) return next(err);
                if (req.body !== {}) contentType = 'application/json';
                urlEncoded(req, res, (err) => {
                    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                    var method = req.method;
                    var url = req.url;
                    var referer = req.headers.referer || "";
                    var ua = req.headers['user-agent'];
                    const span = tracer.startSpan(url)
                    span.setTag("http.method", method);
                    span.setTag("http.referer", referer);
                    span.setTag("http.user-agent", ua);
                    span.setTag("http.ip", ip);
                    // req.body['rootSpan'] = req.egContext.run(span.context());
                    var bodyData = req.body;
                    // bodyData['rootSpan'] = req.egContext.run(span.context());
                    console.log(bodyData)
                    // req.egContext.requestStream = new PassThrough();
                    // req.egContext.requestStream.write(bodyData);
                    // req.headers['content-length'] = Buffer.byteLength(bodyData);
                    // req.headers['content-type'] = contentType;

                    res.on('finish', () => {
                        var code = res._header ? String(res.statusCode) : String(-1);
                        var message = res._header ? String(res.statusMessage) : String(-1);
                        span.setTag("http.status_code", code);
                        if (req.headers && req.headers['ad-userid'])
                            span.setTag("http.user-id", req.headers['ad-userid']);
                        span.setTag("http.status_message", message);
                        span.log({ 'event': 'request_end' });
                        span.finish();
                    });
                    next()
                });
            });
        };
    }
};