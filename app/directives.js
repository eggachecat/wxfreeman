(function(){
	angular
		.module("wxfreeman")
		.filter("searchFilter", searchFilter);

	function searchFilter(){
		function blurry(content, keyWord){

			for (var i = 0; i < keyWord.length; i++) {
				if(keyWord[i] !== content["NickName"][i] && keyWord[i] !== content["RemarkName"][i] && keyWord[i] !== content["PYQuanPin"][i] && keyWord[i] !== content["PYInitial"][i]){
					return false;
				}
			}
			return true;
		}
		return function(contactList, keyWord){

			if(!!! keyWord){
				return contactList;
			}


			var result = [];
			angular.forEach(contactList, function(contact){
				if( blurry(contact, keyWord)){
					result.push(contact)
				}
			})
			return result;
		}
	}
})();