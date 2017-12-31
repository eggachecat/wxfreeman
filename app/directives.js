angular
    .module("wxfreeman.filters", [])
    .filter("contactFilter", function () {
            function isUser(contact) {
                return contact.KeyWord != 'gh_' && contact.UserName.indexOf("@@") < 0
                    && contact.NickName.indexOf("文件传输助手") < 0 && contact.NickName.indexOf("微信团队") < 0
            }

            function isGroup(contact) {
                console.log(contact.UserName)
                return contact.UserName.indexOf("@@") >= 0
            }

            function keepContact(contact, keepUser) {
                if (keepUser) {
                    return isUser(contact)
                } else {
                    return isGroup(contact)
                }
            }

            return function (contactList, keepUser) {
                var out = [];
                for (var i = 0; i < contactList.length; i++) {
                    var contact = contactList[i];
                    if (keepContact(contact, keepUser)) {
                        out.push(contact)
                    }
                }
                return out;
            }
        }
    )
    .filter("priorityFilter", function () {
            return function (contactList) {
                var out = [];
                for (var i = 0; i < contactList.length; i++) {
                    var contact = contactList[i];
                    if (!contact.hasOwnProperty('priority')) {
                        contact['priority'] = 0;
                    }
                    out.push(contact)
                }
                return out;
            }
        }
    )
    .filter("searchFilter", function () {
            function blurry(content, keyWord) {

                for (var i = 0; i < keyWord.length; i++) {
                    if (keyWord[i] !== content["NickName"][i] && keyWord[i] !== content["RemarkName"][i] && keyWord[i] !== content["PYQuanPin"][i] && keyWord[i] !== content["PYInitial"][i]) {
                        return false;
                    }
                }
                return true;
            }

            return function (contactList, keyWord) {
                if (!!!keyWord) {
                    return contactList;
                }

                var result = [];
                angular.forEach(contactList, function (contact) {
                    if (blurry(contact, keyWord)) {
                        result.push(contact)
                    }
                })
                return result;
            }
        }
    );

