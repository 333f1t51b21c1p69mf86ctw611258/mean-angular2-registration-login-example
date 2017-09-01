const appRoot = require('app-root-path');
const userHome = require('user-home');
const md5File = require('md5-file');
const multer = require('multer');
const fs = require('fs');

const DIR_UPLOAD_RELATIVE = '../uploads';
const DIR_UPLOAD_ABSOLUTE = `${appRoot}/uploads`;

const multipart = multer({
    dest: DIR_UPLOAD_RELATIVE,
    rename: function (fieldname, filename) {
        return filename + Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...');
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path);
    }
});

function checksumMD5(file) {
    return md5File.sync(file.path);
}

function createUploadedChildFolderIfNotExisted(childFolder) {
    if (!fs.existsSync(appRoot + `/uploads/${childFolder}`)) {
        fs.mkdirSync(appRoot + `/uploads/${childFolder}`);
    }
}

function saveFirstUploadedFile(req, res, childFolder) {
    let result = null;

    req.files.forEach((file) => {
        let fileName = file.originalname;
        let fileExt = file.originalname.split('.');
        fileExt = fileExt[fileExt.length - 1];
        fileName = file.originalname.split('.');
        fileName.pop();
        fileName = fileName.join('.');

        const md5 = checksumMD5(file);

        createUploadedChildFolderIfNotExisted(childFolder);

        let newFileName = `${fileName}_${md5}.${fileExt}`;
        let newPath = appRoot + `/uploads/${childFolder}/${newFileName}`;

        fs.rename(file.path, newPath, function (err) { });

        result = {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            destination: file.destination,
            filename: newFileName,
            path: childFolder + "/" + newFileName,
            size: file.size,
            md5: md5
        };

        return;
    });

    return result;
}

/// <<< EXPORT
var service = {};

service.DIR_UPLOAD_ABSOLUTE = DIR_UPLOAD_ABSOLUTE;
service.DIR_UPLOAD_RELATIVE = DIR_UPLOAD_RELATIVE;

service.multipart = multipart;
service.checksumMD5 = checksumMD5;
service.createUploadedChildFolderIfNotExisted = createUploadedChildFolderIfNotExisted;
service.saveFirstUploadedFile = saveFirstUploadedFile;

module.exports = service;
/// >>> EXPORT
