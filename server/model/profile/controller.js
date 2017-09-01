const Controller = require('../../lib/controller');
const profileFacade = require('./facade');
const fileService = require('../../services/file.service');
const fs = require('fs');

class ProfileController extends Controller {
    uploadBlacklistFile(req, res) {
        let result = [];

        let childFolder = 'profile';

        const jsonUpload = fileService.saveFirstUploadedFile(req, res, childFolder);

        const filePath = fileService.DIR_UPLOAD_ABSOLUTE + "/" + jsonUpload.path;
        let text = fs.readFileSync(filePath, "utf-8");

        let arr = text.split('\n');

        arr.forEach(function (element) {
            if (element.trim()) {
                result.push({
                    id: 0,
                    blackIp: element,
                    description: element
                });
            }
        }, this);

        res.end(JSON.stringify(result));
    }
}

module.exports = new ProfileController(profileFacade);
